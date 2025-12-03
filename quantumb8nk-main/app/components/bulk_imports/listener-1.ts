// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import api from "@flatfile/api";
import {
  CellValueUnion,
  RecordsWithLinks,
  RecordWithLinks,
} from "@flatfile/api/api";
import { FlatfileListener, FlatfileEvent } from "@flatfile/listener";
import {
  RecordRejections,
  SheetRejections,
} from "@flatfile/util-response-rejection";
import {
  flattenFlatfileData,
  sanitizeRecordMetadata,
} from "./utils/flatfileUtils";
import {
  numericValidator,
  decimalStringValidator,
  dateValidator,
  dateTimeValidator,
  metadataValidator,
  booleanValidator,
} from "./formatValidators";

// Highlights cells with errors by updating each record with any validation errors
const updateSheet = async (sheet: SheetRejections): Promise<void> => {
  if (!sheet.rejectedRecords?.length) {
    return;
  }

  const rejectedRecordsIds = sheet.rejectedRecords.map((record) => record.id);
  const sheetRecords = await api.records.get(sheet.sheetId);

  const rejectedSheetRecords: RecordsWithLinks =
    sheetRecords.data.records?.filter((record: RecordWithLinks) =>
      rejectedRecordsIds.includes(record.id),
    );

  (rejectedSheetRecords || []).forEach((sheetRecord) => {
    const record = sheetRecord;
    const rejectedRecord: RecordRejections | undefined =
      sheet.rejectedRecords.find((item) => item.id === record.id) || undefined;
    if (rejectedRecord) {
      rejectedRecord.values.forEach((value) => {
        if (record.values[value.field]) {
          record.values[value.field].messages = [
            {
              type: "error",
              message: value.message,
            },
          ];
        }
      });
    }
  });
  await api.records.update(sheet.sheetId, rejectedSheetRecords);
};

const getSheetId = async (workbookId: string): Promise<string> => {
  const { data: workbookSheets } = await api.sheets.list({ workbookId });

  // only one sheet of data should be uploaded at one time
  return workbookSheets[0]?.id;
};

const getSheetRecords = async (
  workbookSheetId: string,
  jobId: string,
  resource: string,
): Promise<RecordsWithLinks> => {
  const { data: sheetRecords } = await api.records.get(workbookSheetId);

  const records = sheetRecords?.records;

  if (!records) {
    await api.jobs.fail(jobId, {
      outcome: {
        message: "Upload is empty.",
      },
    });
    return [];
  }

  if (resource !== "invoices" && records.length > 1000) {
    await api.jobs.fail(jobId, {
      outcome: {
        message: `Too many rows (max is 1000, ${records.length} submitted).`,
      },
    });
    return [];
  }
  return sheetRecords?.records;
};

const getSanitizedData = (
  jobId: string,
  resource: string,
  sheetRecords: RecordsWithLinks,
  fieldKeySet: Set<string>,
): Record<string, CellValueUnion | null>[] => {
  // turn into the shape that our validation mutation accepts
  const normalizedData = flattenFlatfileData(sheetRecords);

  // sanitize data before attempting validation
  const { sanitizedRecordData } = sanitizeRecordMetadata(
    normalizedData,
    fieldKeySet,
  );

  return sanitizedRecordData;
};

const tryValidate = async (
  sanitizedRecordData: Record<string, CellValueUnion | null>[],
  sheetRecords: RecordsWithLinks,
  jobId: string,
  sheetId: string,
  validate: (
    resultsData: Array<Record<string, CellValueUnion | null>>,
    sheetRecords: RecordsWithLinks,
  ) => Promise<RecordRejections[]>,
): Promise<boolean> => {
  try {
    const rejectedRecords = await validate(sanitizedRecordData, sheetRecords);

    if (rejectedRecords.length > 0) {
      await updateSheet({
        rejectedRecords,
        sheetId,
      });

      await api.jobs.fail(jobId, {
        outcome: {
          message: `Submission failed. Please correct all errors before submitting again.`,
        },
      });

      return false;
    }
    return true;
  } catch (err) {
    await api.jobs.fail(jobId, {
      outcome: {
        message: "Bulk import validation failed.",
      },
    });

    return false;
  }
};

const trySubmit = async (
  sanitizedRecordData: Record<string, CellValueUnion | null>[],
  workbookSheetId: string,
  jobId: string,
  spaceId: string,
  resource: string,
  onSubmit: (
    resultsData: Array<Record<string, CellValueUnion | null>>,
    flatfileSheetId: string,
    flatfileSpaceId: string,
  ) => Promise<Record<string, string | boolean>>,
): Promise<void> => {
  try {
    const response = await onSubmit(
      sanitizedRecordData,
      workbookSheetId,
      spaceId,
    );
    if (response.success) {
      let path = "";
      if (response.path) {
        path = response.path as string;
      } else if (response.bulkImportId) {
        path = `/bulk_imports/${response.bulkImportId as string}`;
      } else {
        path = `/${resource}`;
      }

      await api.jobs.complete(jobId, {
        outcome: {
          heading: "Bulk Import Submitted",
          message:
            "Thank you, we are processing your file and will send you an email upon completion.",
          acknowledge: true,
          next: {
            type: "url",
            url: `${window.location.origin}${path}`,
            label: "View Bulk Import",
          },
        },
      });
    }
  } catch (err) {
    await api.jobs.fail(jobId, {
      outcome: {
        message: "Bulk import creation failed.",
      },
    });
  }
};

const getFlatfileListener = (
  resource: string,
  fieldKeySet: Set<string>,
  validate: (
    resultsData: Array<Record<string, CellValueUnion | null>>,
    sheetRecords: RecordsWithLinks,
  ) => Promise<RecordRejections[]>,
  onSubmit: (
    resultsData: Array<Record<string, CellValueUnion | null>>,
    flatfileSheetId: string,
    flatfileSpaceId: string,
  ) => Promise<Record<string, string | boolean>>,
) =>
  FlatfileListener.create((listener) => {
    // Format validator listeners
    numericValidator(listener, resource);
    decimalStringValidator(listener, resource);
    dateValidator(listener, resource);
    dateTimeValidator(listener, resource);
    metadataValidator(listener, resource);
    booleanValidator(listener, resource);

    // Upload submission listener
    listener.on(
      "job:ready",
      { job: "workbook:submitActionFg" },
      async ({ context: { jobId, workbookId, spaceId } }: FlatfileEvent) => {
        const sheetId = await getSheetId(workbookId as string);
        const sheetRecords = await getSheetRecords(
          sheetId,
          jobId as string,
          resource,
        );

        if (sheetRecords.length) {
          const sanitizedRecordData = getSanitizedData(
            jobId as string,
            resource,
            sheetRecords,
            fieldKeySet,
          );

          // try validating the data
          const valid = await tryValidate(
            sanitizedRecordData,
            sheetRecords,
            jobId as string,
            sheetId,
            validate,
          );

          if (valid) {
            // submit the data to the bulk create resource mutation
            await trySubmit(
              sanitizedRecordData,
              sheetId,
              jobId as string,
              spaceId as string,
              resource,
              onSubmit,
            );
          }
        }
      },
    );
  });

export default getFlatfileListener;
