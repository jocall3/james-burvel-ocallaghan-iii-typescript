# The Creator's Codex - Sovereign Integration Blueprint
## Module Integrations: The Unification of Cloud, Identity, Storage, and Compute Paradigms

This venerable document delineates the exhaustive, production-ready, and strategically vital integration plan for the foundational infrastructure modules of the Creator's Codex ecosystem: **The Aetherium (Cloud)**, **The Hall of Faces (Identity)**, **The Great Library (Storage)**, and **The Engine Core (Compute)**. Much like a master architect meticulously crafts a grand edifice where every stone finds its purpose, this blueprint ensures a harmonious, robust, and intelligent foundation. Our objective is to transcend conventional infrastructure management, providing a unified, intelligent, and highly performant platform. This blueprint demonstrates how internal operational dashboards are transformed into powerful command centers, driven by real-world, enterprise-grade integrations with leading global cloud and identity providers, engineered for unparalleled control and insight. Every aspect is designed for sovereign control and intelligent automation, embodying the pinnacle of technological foresight.

---

## 1. Cloud Module: The Aetherium - Multiverse Command & Control
### Core Concept
In the grand cosmos of interconnected operations, The Aetherium stands as a celestial cartographer, charting the intricate landscapes of an organization's digital presence across disparate cloud realms. It provides an exquisitely unified, real-time command-and-control interface, offering profound clarity into the vast, evolving cloud footprint. Leveraging advanced SDKs from each respective provider, it ingests, processes, and synthesizes live telemetry—encompassing granular costs, comprehensive resource health, intricate performance metrics, and compliance postures—presenting them within a single, intuitively navigable, and highly customizable dashboard. This isn't merely a ledger of expenses or a catalog of resources; it's a strategic intelligence platform, predictive and prescriptive, designed to optimize every facet of cloud operations, much like a seasoned captain navigates their vessel through both calm and turbulent waters, always with an eye on the horizon.

### Key API Integrations and Strategic Expansion

#### a. AWS SDK (`@aws-sdk/client-cost-explorer`, `@aws-sdk/client-ec2`, `@aws-sdk/client-cloudwatch`, `@aws-sdk/client-s3`)
-   **Purpose:** To achieve profound clarity into AWS operational economics, resource health, and performance envelopes. This includes precise cost and usage attribution from AWS Cost Explorer, real-time operational status of all EC2 instances, deep performance metrics from CloudWatch, and comprehensive S3 bucket management. It offers the wisdom to anticipate needs and the means to act with precision.
-   **Architectural Approach:** A sophisticated, highly available, and scalable backend microservice architecture, potentially deployed within a serverless container environment (e.g., AWS Fargate, Azure Container Apps), will house the AWS integration logic. Configured with secure, ephemeral AWS IAM roles or robust service principals, this service will execute a series of meticulously scheduled, asynchronous jobs. These jobs will leverage the AWS SDKs to perform data harvesting (e.g., hourly for detailed costs, sub-minute for critical instance statuses, real-time for anomaly detection feeds). Results are then subjected to a robust caching layer (e.g., Redis, DynamoDB Accelerator) and a data transformation pipeline, preparing them for real-time aggregation and presentation within the Aetherium's frontend. AI/ML models are embedded to detect cost anomalies, predict future spend, and recommend resource optimization strategies, acting as an unseen, guiding hand.
-   **Code Examples:**
    -   **TypeScript (Backend Service - Dynamic AWS Cost and Usage Aggregation with Predictive Analytics Integration):**
        ```typescript
        // services/aetherium/aws_cost_monitor.ts
        import { CostExplorerClient, GetCostAndUsageCommand, Expression } from "@aws-sdk/client-cost-explorer";
        import { EC2Client, DescribeInstancesCommand, Instance } from "@aws-sdk/client-ec2";
        import { S3Client, ListBucketsCommand, GetBucketLocationCommand, GetBucketTaggingCommand } from "@aws-sdk/client-s3";
        import { CloudWatchClient, GetMetricDataCommand, MetricDataQuery, MetricDataResult } from "@aws-sdk/client-cloudwatch";
        import { config } from 'dotenv'; // For environment variable management
        import { z } from 'zod'; // For robust input validation
        import { logger } from '../utils/logger'; // Centralized logging utility
        import { cache } from '../utils/cache_manager'; // Shared caching utility
        import { generateReportId } from '../utils/uuid_generator'; // Utility for unique report IDs
        import { aiPredictiveCostModel } from '../ai/cost_forecaster'; // AI model integration

        config(); // Load environment variables from .env file

        const AwsConfigSchema = z.object({
          region: z.string().default(process.env.AWS_REGION || "us-east-1"),
          accessKeyId: z.string().optional(), // For programmatic access, typically use IAM roles
          secretAccessKey: z.string().optional(),
        });

        type AwsConfig = z.infer<typeof AwsConfigSchema>;

        export interface AwsCostDataPoint {
          service: string;
          amount: number;
          unit: string;
          prediction?: number; // AI-driven prediction
          anomalyDetected?: boolean;
          optimizationSuggestion?: string; // AI-driven suggestion
        }

        export interface AwsResourceStatus {
          instanceId: string;
          instanceType: string;
          state: string;
          launchTime: Date;
          tags: Record<string, string>;
          metrics?: {
            cpuUtilization?: number;
            networkIn?: number;
            diskOps?: number; // Added
          };
          aiHealthSuggestion?: string; // AI-driven proactive health suggestion
        }

        export interface S3BucketOverview {
          name: string;
          region: string;
          creationDate: Date;
          tags: Record<string, string>;
          // AI-driven recommendations for tiering or security
          tieringRecommendation?: 'STANDARD' | 'IA' | 'GLACIER' | 'DEEP_ARCHIVE';
          securityAlerts?: string[];
          complianceScore?: number; // AI-driven compliance score
        }

        // Initialize clients from validated config
        const initializeAwsClients = (config: AwsConfig) => {
          return {
            costExplorer: new CostExplorerClient({ region: config.region, credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey } }),
            ec2: new EC2Client({ region: config.region, credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey } }),
            s3: new S3Client({ region: config.region, credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey } }),
            cloudwatch: new CloudWatchClient({ region: config.region, credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey } }),
          };
        };

        const awsClients = initializeAwsClients(AwsConfigSchema.parse({})); // Parse and validate config

        /**
         * Fetches and aggregates AWS cost data with AI-driven prediction and optimization suggestions.
         * Much like a gardener observes the growth of their plants to predict the harvest.
         * @param startDate - Start date for cost aggregation (YYYY-MM-DD).
         * @param endDate - End date for cost aggregation (YYYY-MM-DD).
         * @param granularity - Granularity of data (DAILY, MONTHLY, HOURLY).
         * @returns Array of AwsCostDataPoint, including AI predictions and suggestions.
         */
        export async function getAggregatedAwsCost(
          startDate: string,
          endDate: string,
          granularity: "DAILY" | "MONTHLY" | "HOURLY" = "MONTHLY",
          groupByDimension: string = "SERVICE"
        ): Promise<AwsCostDataPoint[] | undefined> {
          const cacheKey = `aws-cost-${startDate}-${endDate}-${granularity}-${groupByDimension}`;
          const cachedData = await cache.get<AwsCostDataPoint[]>(cacheKey);
          if (cachedData) {
            logger.info(`Serving AWS cost data from cache for ${cacheKey}`);
            return cachedData;
          }

          logger.info(`Fetching AWS cost data for ${startDate} to ${endDate} with granularity ${granularity}`);
          const command = new GetCostAndUsageCommand({
            TimePeriod: { Start: startDate, End: endDate },
            Granularity: granularity,
            Metrics: ["UnblendedCost", "UsageQuantity"],
            GroupBy: [{ Type: "DIMENSION", Key: groupByDimension }],
            Filter: {
              // Example: Only include costs for 'Production' environment
              Dimensions: {
                Key: "TAG",
                Values: ["environment:production"]
              }
            } as Expression, // Type assertion for complex filter
          });

          try {
            const response = await awsClients.costExplorer.send(command);
            const results: AwsCostDataPoint[] = [];

            if (response.ResultsByTime && response.ResultsByTime.length > 0) {
              for (const timePeriod of response.ResultsByTime) {
                for (const group of timePeriod.Groups || []) {
                  const serviceName = group.Keys ? group.Keys[0] : 'UNKNOWN_SERVICE';
                  const costAmount = parseFloat(group.Metrics?.UnblendedCost?.Amount || '0');
                  const costUnit = group.Metrics?.UnblendedCost?.Unit || 'USD';

                  // Integrate AI for predictive cost modeling and optimization
                  const predictedCost = await aiPredictiveCostModel.predictCost(serviceName, costAmount, timePeriod.TimePeriod?.Start || startDate);
                  const anomalyDetected = await aiPredictiveCostModel.detectAnomaly(serviceName, costAmount);
                  const optimizationSuggestion = await aiPredictiveCostModel.suggestCostOptimization(serviceName, costAmount);


                  results.push({
                    service: serviceName,
                    amount: costAmount,
                    unit: costUnit,
                    prediction: predictedCost,
                    anomalyDetected: anomalyDetected,
                    optimizationSuggestion: optimizationSuggestion,
                  });
                }
              }
            }
            await cache.set(cacheKey, results, 3600); // Cache for 1 hour
            logger.info(`Successfully fetched and cached AWS cost data. Report ID: ${generateReportId()}`);
            return results;
          } catch (error) {
            logger.error(`Error fetching AWS cost data: ${(error as Error).message}`, { error });
            throw new Error(`Failed to retrieve AWS cost data: ${(error as Error).message}`);
          }
        }

        /**
         * Fetches detailed status and metrics for all EC2 instances, enriched with AI health suggestions.
         * Like a seasoned physician, assessing vital signs for proactive care.
         * @returns Array of AwsResourceStatus.
         */
        export async function getEc2InstanceStatus(): Promise<AwsResourceStatus[]> {
          const cacheKey = `aws-ec2-status`;
          const cachedData = await cache.get<AwsResourceStatus[]>(cacheKey);
          if (cachedData) {
            logger.info(`Serving EC2 instance status from cache for ${cacheKey}`);
            return cachedData;
          }

          logger.info("Fetching EC2 instance status...");
          const instances: AwsResourceStatus[] = [];
          try {
            const command = new DescribeInstancesCommand({
              Filters: [{ Name: "instance-state-name", Values: ["running", "pending", "stopping", "stopped"] }]
            });
            const response = await awsClients.ec2.send(command);

            for (const reservation of response.Reservations || []) {
              for (const instance of reservation.Instances || []) {
                const tags: Record<string, string> = {};
                for (const tag of instance.Tags || []) {
                  if (tag.Key && tag.Value) {
                    tags[tag.Key] = tag.Value;
                  }
                }

                const instanceStatus: AwsResourceStatus = {
                  instanceId: instance.InstanceId!,
                  instanceType: instance.InstanceType!,
                  state: instance.State?.Name!,
                  launchTime: instance.LaunchTime!,
                  tags: tags,
                };
                // Fetch CloudWatch metrics for this instance (e.g., CPU Utilization)
                const metricData = await getEc2InstanceMetrics(instance.InstanceId!, awsClients.cloudwatch);
                instanceStatus.metrics = {
                  cpuUtilization: metricData.cpuUtilization,
                  networkIn: metricData.networkIn,
                  diskOps: metricData.diskOps,
                };

                // AI Integration for proactive health suggestions
                instanceStatus.aiHealthSuggestion = await aiPredictiveCostModel.suggestEc2HealthAction(instance.InstanceId!, instanceStatus.metrics);

                instances.push(instanceStatus);
              }
            }
            await cache.set(cacheKey, instances, 300); // Cache for 5 minutes
            logger.info("Successfully fetched and cached EC2 instance statuses.");
            return instances;
          } catch (error) {
            logger.error(`Error fetching EC2 instance status: ${(error as Error).message}`, { error });
            throw new Error(`Failed to retrieve EC2 instance status: ${(error as Error).message}`);
          }
        }

        /**
         * Helper to fetch specific CloudWatch metrics for an EC2 instance.
         */
        async function getEc2InstanceMetrics(instanceId: string, cloudwatchClient: CloudWatchClient): Promise<{ cpuUtilization?: number; networkIn?: number; diskOps?: number }> {
          const endTime = new Date();
          const startTime = new Date(endTime.getTime() - 5 * 60 * 1000); // Last 5 minutes

          const queries: MetricDataQuery[] = [
            {
              Id: "cpuutil",
              MetricStat: {
                Metric: {
                  Namespace: "AWS/EC2",
                  MetricName: "CPUUtilization",
                  Dimensions: [{ Name: "InstanceId", Value: instanceId }],
                },
                Period: 300, // 5 minutes
                Stat: "Average",
              },
            },
            {
              Id: "networkin",
              MetricStat: {
                Metric: {
                  Namespace: "AWS/EC2",
                  MetricName: "NetworkIn",
                  Dimensions: [{ Name: "InstanceId", Value: instanceId }],
                },
                Period: 300,
                Stat: "Sum", // Total bytes in
              },
            },
            {
              Id: "diskops",
              MetricStat: {
                Metric: {
                  Namespace: "AWS/EC2",
                  MetricName: "DiskReadOps", // Or DiskWriteOps, or sum of both
                  Dimensions: [{ Name: "InstanceId", Value: instanceId }],
                },
                Period: 300,
                Stat: "Sum",
              },
            },
          ];

          try {
            const command = new GetMetricDataCommand({
              MetricDataQueries: queries,
              StartTime: startTime,
              EndTime: endTime,
            });
            const response = await cloudwatchClient.send(command);
            const results: { cpuUtilization?: number; networkIn?: number; diskOps?: number } = {};

            response.MetricDataResults?.forEach((result: MetricDataResult) => {
              if (result.Id === "cpuutil" && result.Values && result.Values.length > 0) {
                results.cpuUtilization = result.Values[0];
              } else if (result.Id === "networkin" && result.Values && result.Values.length > 0) {
                results.networkIn = result.Values[0];
              } else if (result.Id === "diskops" && result.Values && result.Values.length > 0) {
                results.diskOps = result.Values[0];
              }
            });
            return results;
          } catch (error) {
            logger.warn(`Could not fetch CloudWatch metrics for instance ${instanceId}: ${(error as Error).message}`);
            return {};
          }
        }

        /**
         * Fetches an overview of all S3 buckets and applies AI-driven recommendations and compliance scores.
         * Like a seasoned librarian organizing an immense collection for optimal access and preservation.
         * @returns Array of S3BucketOverview.
         */
        export async function getS3BucketsOverview(): Promise<S3BucketOverview[]> {
          const cacheKey = `aws-s3-overview`;
          const cachedData = await cache.get<S3BucketOverview[]>(cacheKey);
          if (cachedData) {
            logger.info(`Serving S3 bucket overview from cache for ${cacheKey}`);
            return cachedData;
          }

          logger.info("Fetching S3 bucket overview...");
          const bucketsOverview: S3BucketOverview[] = [];
          try {
            const listBucketsCommand = new ListBucketsCommand({});
            const listBucketsResponse = await awsClients.s3.send(listBucketsCommand);

            for (const bucket of listBucketsResponse.Buckets || []) {
              if (bucket.Name && bucket.CreationDate) {
                let bucketRegion = 'us-east-1'; // Default
                try {
                  const getBucketLocationCommand = new GetBucketLocationCommand({ Bucket: bucket.Name });
                  const locationResponse = await awsClients.s3.send(getBucketLocationCommand);
                  bucketRegion = locationResponse.LocationConstraint || 'us-east-1'; // 'null' for us-east-1
                } catch (locationError) {
                  logger.warn(`Could not determine region for bucket ${bucket.Name}: ${(locationError as Error).message}`);
                }

                let bucketTags: Record<string, string> = {};
                try {
                    const getBucketTaggingCommand = new GetBucketTaggingCommand({ Bucket: bucket.Name });
                    const taggingResponse = await awsClients.s3.send(getBucketTaggingCommand);
                    taggingResponse.TagSet?.forEach(tag => {
                        if (tag.Key && tag.Value) {
                            bucketTags[tag.Key] = tag.Value;
                        }
                    });
                } catch (taggingError: any) {
                    // S3 buckets without tags will throw NoSuchTagSet error, which is fine.
                    if (taggingError.name !== 'NoSuchTagSet') {
                        logger.warn(`Could not fetch tags for bucket ${bucket.Name}: ${taggingError.message}`);
                    }
                }

                // AI-driven analysis for tiering, security, and compliance
                const tieringRecommendation = await aiPredictiveCostModel.recommendS3Tiering(bucket.Name, bucketTags);
                const securityAlerts = await aiPredictiveCostModel.analyzeS3Security(bucket.Name, bucketTags);
                const complianceScore = await aiPredictiveCostModel.assessS3Compliance(bucket.Name, bucketTags);

                bucketsOverview.push({
                  name: bucket.Name,
                  region: bucketRegion,
                  creationDate: bucket.CreationDate,
                  tags: bucketTags,
                  tieringRecommendation: tieringRecommendation,
                  securityAlerts: securityAlerts,
                  complianceScore: complianceScore,
                });
              }
            }
            await cache.set(cacheKey, bucketsOverview, 3600); // Cache for 1 hour
            logger.info("Successfully fetched and cached S3 bucket overview with AI insights.");
            return bucketsOverview;
          } catch (error) {
            logger.error(`Error fetching S3 bucket overview: ${(error as Error).message}`, { error });
            throw new Error(`Failed to retrieve S3 bucket overview: ${(error as Error).message}`);
          }
        }
        ```
    -   **TypeScript (Backend Service - EC2 Instance Management):**
        ```typescript
        // services/aetherium/aws_ec2_actions.ts
        import { EC2Client, StartInstancesCommand, StopInstancesCommand, RebootInstancesCommand, AssociateAddressCommand, DisassociateAddressCommand } from "@aws-sdk/client-ec2";
        import { config } from 'dotenv';
        import { logger } from '../utils/logger';
        import { aiComputeOptimizer } from '../ai/compute_optimizer'; // AI model integration for action logging

        config();

        const ec2Client = new EC2Client({ region: process.env.AWS_REGION || "us-east-1" });

        /**
         * Starts a specified EC2 instance.
         * A gentle nudge to awaken a dormant resource.
         * @param instanceId The ID of the EC2 instance to start.
         * @returns Promise indicating success or failure.
         */
        export async function startEc2Instance(instanceId: string): Promise<void> {
          logger.info(`Attempting to start EC2 instance: ${instanceId}`);
          const command = new StartInstancesCommand({ InstanceIds: [instanceId] });
          try {
            await ec2Client.send(command);
            logger.info(`Successfully initiated start for EC2 instance: ${instanceId}`);
            aiComputeOptimizer.logVmAction(instanceId, "start", "successful", "AWS");
          } catch (error) {
            logger.error(`Failed to start EC2 instance ${instanceId}: ${(error as Error).message}`, { error });
            aiComputeOptimizer.logVmAction(instanceId, "start", "failed", "AWS", { errorMessage: (error as Error).message });
            throw new Error(`Failed to start instance ${instanceId}: ${(error as Error).message}`);
          }
        }

        /**
         * Stops a specified EC2 instance.
         * A considered pause, conserving resources when no longer actively needed.
         * @param instanceId The ID of the EC2 instance to stop.
         * @returns Promise indicating success or failure.
         */
        export async function stopEc2Instance(instanceId: string): Promise<void> {
          logger.info(`Attempting to stop EC2 instance: ${instanceId}`);
          const command = new StopInstancesCommand({ InstanceIds: [instanceId] });
          try {
            await ec2Client.send(command);
            logger.info(`Successfully initiated stop for EC2 instance: ${instanceId}`);
            aiComputeOptimizer.logVmAction(instanceId, "stop", "successful", "AWS");
          } catch (error) {
            logger.error(`Failed to stop EC2 instance ${instanceId}: ${(error as Error).message}`, { error });
            aiComputeOptimizer.logVmAction(instanceId, "stop", "failed", "AWS", { errorMessage: (error as Error).message });
            throw new Error(`Failed to stop instance ${instanceId}: ${(error as Error).message}`);
          }
        }

        /**
         * Reboots a specified EC2 instance.
         * A refreshing cycle, restoring vigor and clarity.
         * @param instanceId The ID of the EC2 instance to reboot.
         * @returns Promise indicating success or failure.
         */
        export async function rebootEc2Instance(instanceId: string): Promise<void> {
          logger.info(`Attempting to reboot EC2 instance: ${instanceId}`);
          const command = new RebootInstancesCommand({ InstanceIds: [instanceId] });
          try {
            await ec2Client.send(command);
            logger.info(`Successfully initiated reboot for EC2 instance: ${instanceId}`);
            aiComputeOptimizer.logVmAction(instanceId, "reboot", "successful", "AWS");
          } catch (error) {
            logger.error(`Failed to reboot EC2 instance ${instanceId}: ${(error as Error).message}`, { error });
            aiComputeOptimizer.logVmAction(instanceId, "reboot", "failed", "AWS", { errorMessage: (error as Error).message });
            throw new Error(`Failed to reboot instance ${instanceId}: ${(error as Error).message}`);
          }
        }

        /**
         * Associates an Elastic IP address with an EC2 instance.
         * Like assigning a permanent address to a transient traveler.
         * @param instanceId The ID of the EC2 instance.
         * @param allocationId The Allocation ID of the Elastic IP.
         */
        export async function associateElasticIp(instanceId: string, allocationId: string): Promise<void> {
          logger.info(`Associating Elastic IP ${allocationId} with instance ${instanceId}`);
          const command = new AssociateAddressCommand({ InstanceId: instanceId, AllocationId: allocationId });
          try {
            await ec2Client.send(command);
            logger.info(`Successfully associated Elastic IP ${allocationId} with ${instanceId}`);
            aiComputeOptimizer.logVmAction(instanceId, "associate_eip", "successful", "AWS", { allocationId });
          } catch (error) {
            logger.error(`Failed to associate Elastic IP ${allocationId} with instance ${instanceId}: ${(error as Error).message}`, { error });
            aiComputeOptimizer.logVmAction(instanceId, "associate_eip", "failed", "AWS", { allocationId, errorMessage: (error as Error).message });
            throw new Error(`Failed to associate EIP: ${(error as Error).message}`);
          }
        }

        /**
         * Disassociates an Elastic IP address from an EC2 instance.
         * Releasing a resource back into the common pool.
         * @param associationId The Association ID of the Elastic IP to disassociate.
         */
        export async function disassociateElasticIp(associationId: string): Promise<void> {
          logger.info(`Disassociating Elastic IP with association ID: ${associationId}`);
          const command = new DisassociateAddressCommand({ AssociationId: associationId });
          try {
            await ec2Client.send(command);
            logger.info(`Successfully disassociated Elastic IP with association ID: ${associationId}`);
            aiComputeOptimizer.logVmAction('N/A', "disassociate_eip", "successful", "AWS", { associationId }); // Instance ID not directly available here
          } catch (error) {
            logger.error(`Failed to disassociate Elastic IP ${associationId}: ${(error as Error).message}`, { error });
            aiComputeOptimizer.logVmAction('N/A', "disassociate_eip", "failed", "AWS", { associationId, errorMessage: (error as Error).message });
            throw new Error(`Failed to disassociate EIP: ${(error as Error).message}`);
          }
        }
        ```

#### b. Google Cloud Billing & Resource Manager SDKs
-   **Purpose:** To integrate GCP billing information and project/resource hierarchy, providing a holistic multi-cloud cost view within The Aetherium. This allows for a complete understanding of financial currents across all digital territories.
-   **Architectural Approach:** A complementary microservice, mirroring the AWS integration, will utilize the Google Cloud Billing and Resource Manager SDKs. It will fetch organization-level billing reports, project metadata, and resource tags. This data, once normalized, will be ingested into the Aetherium's central data lake and processed for unified cost allocation and intelligent recommendation generation. Just as a careful steward tracks every expenditure in a vast estate, so too does this service ensure fiscal clarity.
-   **Code Examples (Conceptual TypeScript - GCP Billing Integration):**
    ```typescript
    // services/aetherium/gcp_cost_monitor.ts
    import { GoogleAuth } from 'google-auth-library';
    import { BigQuery } from '@google-cloud/bigquery'; // Explicitly using BigQuery client
    import { logger } from '../utils/logger';
    import { cache } from '../utils/cache_manager';
    import { generateReportId } from '../utils/uuid_generator';
    import { aiPredictiveCostModel } from '../ai/cost_forecaster'; // AI model integration
    import { z } from 'zod'; // For robust input validation
    import { config } from 'dotenv'; // For environment variable management

    config();

    const GcpBillingConfigSchema = z.object({
      projectId: z.string().default(process.env.GCP_PROJECT_ID || ""),
      billingDatasetId: z.string().default(process.env.GCP_BILLING_DATASET_ID || ""),
      billingTableId: z.string().default(process.env.GCP_BILLING_TABLE_ID || ""),
    });

    type GcpBillingConfig = z.infer<typeof GcpBillingConfigSchema>;

    const gcpConfig = GcpBillingConfigSchema.parse({});

    if (!gcpConfig.projectId || !gcpConfig.billingDatasetId || !gcpConfig.billingTableId) {
      logger.error("Incomplete GCP billing configuration. Ensure GCP_PROJECT_ID, GCP_BILLING_DATASET_ID, GCP_BILLING_TABLE_ID are set.");
      // Depending on context, might throw or just log a warning and return empty results.
      // For this example, we'll allow it to proceed but expect errors on API calls.
    }


    export interface GcpCostDataPoint {
      project: string;
      service: string;
      cost: number;
      currency: string;
      prediction?: number;
      anomalyDetected?: boolean;
      optimizationSuggestion?: string;
    }

    /**
     * Fetches and aggregates GCP cost data from a BigQuery export, enhanced with AI predictions.
     * Assumes billing data is exported to a BigQuery dataset.
     * Like discerning the patterns in the flow of resources to foresee future needs.
     * @param startDate - Start date for cost aggregation (YYYY-MM-DD).
     * @param endDate - End date for cost aggregation (YYYY-MM-DD).
     * @returns Array of GcpCostDataPoint, including AI predictions and optimization suggestions.
     */
    export async function getAggregatedGcpCost(
      startDate: string,
      endDate: string
    ): Promise<GcpCostDataPoint[]> {
      const { projectId, billingDatasetId, billingTableId } = gcpConfig;

      if (!projectId || !billingDatasetId || !billingTableId) {
        logger.error("GCP billing configuration is missing. Cannot fetch cost data.");
        return [];
      }

      const cacheKey = `gcp-cost-${projectId}-${billingDatasetId}-${billingTableId}-${startDate}-${endDate}`;
      const cachedData = await cache.get<GcpCostDataPoint[]>(cacheKey);
      if (cachedData) {
        logger.info(`Serving GCP cost data from cache for ${cacheKey}`);
        return cachedData;
      }

      logger.info(`Fetching GCP cost data from BigQuery for project ${projectId}...`);

      const bigquery = new BigQuery({ projectId: projectId });

      const query = `
        SELECT
          project.id AS project,
          service.description AS service,
          SUM(cost) AS total_cost,
          currency
        FROM
          \`${projectId}.${billingDatasetId}.${billingTableId}\`
        WHERE
          _PARTITIONDATE BETWEEN @startDate AND @endDate
        GROUP BY
          project, service, currency
        ORDER BY
          total_cost DESC
      `;

      const options = {
        query: query,
        location: 'US', // Specify your BigQuery dataset location
        params: {
          startDate: startDate,
          endDate: endDate,
        },
      };

      try {
        const [job] = await bigquery.createQueryJob(options);
        logger.info(`BigQuery job ${job.id} started for GCP cost data.`);

        const [rows] = await job.getQueryResults();

        if (!rows || rows.length === 0) {
          logger.warn('No rows found in GCP BigQuery cost export.');
          return [];
        }

        const results: GcpCostDataPoint[] = [];
        for (const row of rows) {
          const project = row.project;
          const service = row.service;
          const cost = parseFloat(row.total_cost);
          const currency = row.currency;

          const predictedCost = await aiPredictiveCostModel.predictCost(service, cost, startDate);
          const anomalyDetected = await aiPredictiveCostModel.detectAnomaly(service, cost);
          const optimizationSuggestion = await aiPredictiveCostModel.suggestCostOptimization(service, cost);

          results.push({
            project,
            service,
            cost,
            currency,
            prediction: predictedCost,
            anomalyDetected: anomalyDetected,
            optimizationSuggestion: optimizationSuggestion,
          });
        }
        await cache.set(cacheKey, results, 3600);
        logger.info(`Successfully fetched and cached GCP cost data. Report ID: ${generateReportId()}`);
        return results;
      } catch (error) {
        logger.error(`Error fetching GCP cost data from BigQuery: ${(error as Error).message}`, { error });
        throw new Error(`Failed to retrieve GCP cost data: ${(error as Error).message}`);
      }
    }
    ```

---

## 2. Identity Module: The Hall of Faces - Unified Persona & Access Governance
### Core Concept
Consider the Hall of Faces as the skilled artisan, entrusted with the delicate tapestry of identities and the secure pathways they traverse. This module establishes itself as the sovereign identity governance layer for the entire Creator's Codex, transcending simple user management. It provides a robust, compliant, and highly secure abstraction over leading external Identity Providers (IdPs), ensuring that each persona within the system is both uniquely recognized and appropriately guided. This module is designed to deliver a frictionless user experience while enforcing granular authentication, fine-grained authorization policies, and comprehensive identity lifecycle management. It acts as an intelligent, custom-branded UI and API facade, enriching the capabilities of industry-standard identity platforms with predictive security and automated compliance checks. Each interaction is a thread woven with care, yet observed with vigilance, ensuring the integrity of the whole.

### Key API Integrations and Strategic Expansion

#### a. Auth0 Management API & Authentication API
-   **Purpose:** To achieve orchestrated precision over the Auth0 tenant, enabling seamless user lifecycle management (provisioning, de-provisioning, attribute updates), role-based access control (RBAC), multi-factor authentication (MFA) policy enforcement, and real-time security event monitoring. This is the careful hand that guides and protects each individual's journey.
-   **Architectural Approach:** A dedicated, highly secured Identity Management Service (IMS) acts as the intermediary between the Creator's Codex UI/backend and Auth0. This service operates with least-privilege Auth0 Management API tokens, obtained securely via client credentials flow. All identity operations are logged, audited, and potentially fed into an AI-driven behavioral analytics engine to detect suspicious activity (e.g., unusual login patterns, rapid role changes), like a watchful sentinel guarding the realm. The IMS also orchestrates integration with other identity sources (e.g., corporate directories) via Auth0's extensibility points (Rules, Hooks, Actions).
-   **Code Examples:**
    -   **Python (Backend Service - Comprehensive User Management with AI Anomaly Detection):**
        ```python
        # services/hall_of_faces/auth0_manager.py
        import requests
        import os
        import json
        from typing import List, Dict, Any, Optional
        from datetime import datetime, timedelta

        from dotenv import load_dotenv # For environment variables
        from src.utils.logger import logger # Centralized logging utility
        from src.utils.cache_manager import cache # Shared caching utility
        from src.ai.identity_security_advisor import IdentitySecurityAdvisor # AI model integration

        load_dotenv()

        # Configuration - using environment variables for sensitive data
        AUTH0_DOMAIN: str = os.environ.get("AUTH0_DOMAIN", "")
        AUTH0_MGMT_CLIENT_ID: str = os.environ.get("AUTH0_MGMT_CLIENT_ID", "")
        AUTH0_MGMT_CLIENT_SECRET: str = os.environ.get("AUTH0_MGMT_CLIENT_SECRET", "")
        AUTH0_AUDIENCE: str = f"https://{AUTH0_DOMAIN}/api/v2/"

        class Auth0ManagerException(Exception):
            """Custom exception for Auth0 Manager errors."""
            pass

        class Auth0Manager:
            _instance = None

            def __new__(cls):
                if cls._instance is None:
                    cls._instance = super(Auth0Manager, cls).__new__(cls)
                    cls._instance._access_token: Optional[str] = None
                    cls._instance._token_expiry: Optional[datetime] = None
                    cls._instance._initialize_auth0()
                return cls._instance

            def _initialize_auth0(self):
                if not all([AUTH0_DOMAIN, AUTH0_MGMT_CLIENT_ID, AUTH0_MGMT_CLIENT_SECRET]):
                    logger.error("Auth0 environment variables are not fully configured.")
                    raise Auth0ManagerException("Missing Auth0 configuration.")
                logger.info("Auth0Manager initialized.")

            async def _get_management_api_token(self) -> str:
                """
                Obtains a new Auth0 Management API token or returns a cached, valid one.
                Handles token expiry and refresh, much like refreshing a key to a vault.
                """
                if self._access_token and self._token_expiry and self._token_expiry > datetime.utcnow() + timedelta(seconds=60):
                    logger.debug("Using cached Auth0 Management API token.")
                    return self._access_token

                logger.info("Acquiring new Auth0 Management API token...")
                token_url = f"https://{AUTH0_DOMAIN}/oauth/token"
                headers = {"Content-Type": "application/json"}
                payload = {
                    "client_id": AUTH0_MGMT_CLIENT_ID,
                    "client_secret": AUTH0_MGMT_CLIENT_SECRET,
                    "audience": AUTH0_AUDIENCE,
                    "grant_type": "client_credentials"
                }
                try:
                    response = requests.post(token_url, json=payload, headers=headers)
                    response.raise_for_status()
                    data = response.json()
                    self._access_token = data["access_token"]
                    self._token_expiry = datetime.utcnow() + timedelta(seconds=data["expires_in"])
                    logger.info("Successfully acquired new Auth0 Management API token.")
                    return self._access_token
                except requests.exceptions.RequestException as e:
                    logger.error(f"Failed to acquire Auth0 Management API token: {e}", exc_info=True)
                    raise Auth0ManagerException(f"Auth0 token acquisition failed: {e}")

            async def _make_auth0_request(self, method: str, path: str, **kwargs) -> Dict[str, Any]:
                """Helper to make authenticated requests to Auth0 Management API."""
                token = await self._get_management_api_token()
                url = f"{AUTH0_AUDIENCE}{path}"
                headers = {
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
                kwargs.setdefault('headers', {}).update(headers)
                try:
                    response = requests.request(method, url, **kwargs)
                    response.raise_for_status()
                    return response.json()
                except requests.exceptions.HTTPError as e:
                    error_details = e.response.json() if e.response else "No response body"
                    logger.error(f"Auth0 API request failed ({method} {path}): {e.response.status_code} - {error_details}", exc_info=True)
                    raise Auth0ManagerException(f"Auth0 API error: {e.response.status_code} - {error_details}")
                except requests.exceptions.RequestException as e:
                    logger.error(f"Auth0 API request failed ({method} {path}): {e}", exc_info=True)
                    raise Auth0ManagerException(f"Auth0 network error: {e}")

            async def get_user(self, user_id: str) -> Dict[str, Any]:
                """Fetches details for a specific user, like reading a chapter about a known character."""
                cache_key = f"auth0_user_{user_id}"
                cached_user = await cache.get(cache_key)
                if cached_user:
                    logger.debug(f"Serving user {user_id} from cache.")
                    return cached_user
                logger.info(f"Fetching user: {user_id}")
                user_data = await self._make_auth0_request("GET", f"users/{user_id}")
                await cache.set(cache_key, user_data, ex=300) # Cache for 5 mins
                return user_data

            async def list_users(self, page: int = 0, per_page: int = 100, include_totals: bool = True, fields: Optional[List[str]] = None) -> Dict[str, Any]:
                """Lists users in the Auth0 tenant with pagination and field filtering, like observing the assembled populace."""
                logger.info(f"Listing users (page {page}, per_page {per_page})...")
                params = {
                    "page": page,
                    "per_page": per_page,
                    "include_totals": str(include_totals).lower()
                }
                if fields:
                    params["fields"] = ",".join(fields)
                    params["include_fields"] = "true"

                cache_key = f"auth0_users_p{page}_pp{per_page}_f{'_'.join(fields or [])}"
                cached_users_data = await cache.get(cache_key)
                if cached_users_data:
                    logger.debug(f"Serving users from cache for {cache_key}.")
                    return cached_users_data

                users_data = await self._make_auth0_request("GET", "users", params=params)

                # AI Integration: Analyze login patterns for anomalies
                for user in users_data.get('users', []):
                    user_id = user.get('user_id')
                    last_login_raw = user.get('last_login')
                    last_login_ip = user.get('last_ip') # Auth0 often provides this
                    if user_id and last_login_raw:
                        last_login_time = datetime.fromisoformat(last_login_raw.replace('Z', '+00:00'))
                        is_anomalous_login = await IdentitySecurityAdvisor.analyze_login_pattern(user_id, last_login_time, last_login_ip)
                        if is_anomalous_login:
                            user['security_alert'] = 'Anomalous login pattern detected'
                            logger.warning(f"Security Alert: Anomalous login for user {user_id}")
                        user['risk_score'] = await IdentitySecurityAdvisor.assess_user_risk(user_id, user) # AI-driven risk score
                await cache.set(cache_key, users_data, ex=60) # Cache for 1 minute
                return users_data

            async def block_user(self, user_id: str) -> Dict[str, Any]:
                """Blocks a user in the Auth0 tenant, like closing a gate for a suspected trespasser."""
                logger.warning(f"Attempting to block user: {user_id}. Initiating security audit.")
                payload = {"blocked": True}
                response = await self._make_auth0_request("PATCH", f"users/{user_id}", json=payload)
                logger.info(f"Successfully blocked user {user_id}. Initiating AI audit for user deactivation reasons.")
                await cache.delete(f"auth0_user_{user_id}") # Invalidate cache
                await IdentitySecurityAdvisor.log_user_action(user_id, "block", "successful", {"reason": "manual_action"}) # Log for AI
                return response

            async def unblock_user(self, user_id: str) -> Dict[str, Any]:
                """Unblocks a user in the Auth0 tenant, like reopening a pathway after due diligence."""
                logger.info(f"Attempting to unblock user: {user_id}.")
                payload = {"blocked": False}
                response = await self._make_auth0_request("PATCH", f"users/{user_id}", json=payload)
                logger.info(f"Successfully unblocked user {user_id}.")
                await cache.delete(f"auth0_user_{user_id}") # Invalidate cache
                await IdentitySecurityAdvisor.log_user_action(user_id, "unblock", "successful") # Log for AI
                return response

            async def create_user(self, email: str, password: str, connection: str = "Username-Password-Authentication", **user_metadata) -> Dict[str, Any]:
                """Creates a new user in Auth0, like welcoming a new member into the community."""
                logger.info(f"Creating new user with email: {email}")
                payload = {
                    "email": email,
                    "password": password,
                    "connection": connection,
                    "email_verified": False,
                    "user_metadata": user_metadata
                }
                response = await self._make_auth0_request("POST", "users", json=payload)
                logger.info(f"User {email} created successfully with ID: {response.get('user_id')}")
                await IdentitySecurityAdvisor.log_user_action(response.get('user_id', 'N/A'), "create", "successful") # Log for AI
                return response

            async def update_user_metadata(self, user_id: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
                """Updates user metadata for a given user, akin to updating a personal record."""
                logger.info(f"Updating user metadata for {user_id}: {metadata}")
                payload = {"user_metadata": metadata}
                response = await self._make_auth0_request("PATCH", f"users/{user_id}", json=payload)
                logger.info(f"User {user_id} metadata updated successfully.")
                await cache.delete(f"auth0_user_{user_id}") # Invalidate cache
                await IdentitySecurityAdvisor.log_user_action(user_id, "update_metadata", "successful", {"updated_keys": list(metadata.keys())}) # Log for AI
                return response

            async def assign_roles_to_user(self, user_id: str, role_ids: List[str]) -> None:
                """Assigns roles to a user, bestowing new responsibilities."""
                logger.info(f"Assigning roles {role_ids} to user {user_id}.")
                payload = {"roles": role_ids}
                await self._make_auth0_request("POST", f"users/{user_id}/roles", json=payload)
                logger.info(f"Roles assigned to user {user_id} successfully.")
                await cache.delete(f"auth0_user_{user_id}") # Invalidate cache
                await IdentitySecurityAdvisor.log_user_action(user_id, "assign_roles", "successful", {"roles": role_ids}) # Log for AI

            async def remove_roles_from_user(self, user_id: str, role_ids: List[str]) -> None:
                """Removes roles from a user, relieving them of certain duties."""
                logger.info(f"Removing roles {role_ids} from user {user_id}.")
                payload = {"roles": role_ids}
                await self._make_auth0_request("DELETE", f"users/{user_id}/roles", json=payload)
                logger.info(f"Roles removed from user {user_id} successfully.")
                await cache.delete(f"auth0_user_{user_id}") # Invalidate cache
                await IdentitySecurityAdvisor.log_user_action(user_id, "remove_roles", "successful", {"roles": role_ids}) # Log for AI

            async def list_roles(self, page: int = 0, per_page: int = 50) -> Dict[str, Any]:
                """Lists all roles available in Auth0, enumerating the various functions within the community."""
                logger.info(f"Listing roles (page {page}, per_page {per_page})...")
                params = {
                    "page": page,
                    "per_page": per_page
                }
                cache_key = f"auth0_roles_p{page}_pp{per_page}"
                cached_roles_data = await cache.get(cache_key)
                if cached_roles_data:
                    logger.debug(f"Serving roles from cache for {cache_key}.")
                    return cached_roles_data
                roles_data = await self._make_auth0_request("GET", "roles", params=params)
                await cache.set(cache_key, roles_data, ex=300) # Cache for 5 minutes
                return roles_data

        # Export a singleton instance of the manager
        auth0_manager = Auth0Manager()
        ```

#### b. Azure Active Directory (Microsoft Entra ID) Graph API
-   **Purpose:** To enable seamless integration with corporate Microsoft identity ecosystems, allowing for synchronization of users and groups, management of enterprise applications, and enforcement of conditional access policies within The Hall of Faces. This ensures that the collective identity within the organization moves as one, guided by consistent principles.
-   **Architectural Approach:** A parallel microservice, tightly integrated with the IMS, will connect to the Microsoft Graph API. This allows for reading user/group data from Azure AD, performing actions like inviting external users, and managing application registrations. AI-powered risk assessment from Azure AD Identity Protection will be ingested to provide a unified risk score for users across all connected IdPs, adding layers of foresight to the security posture.
-   **Code Examples (Conceptual C# - Azure AD User Management):**
    ```csharp
    // services/hall_of_faces/azure_ad_manager.cs
    using Azure.Identity;
    using Microsoft.Graph;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Configuration;
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using System.Linq;

    // Assuming a structured logging service and cache manager exist,
    // and an AI security advisor as in the Python example.
    using CreatorCodex.Utils; // For Logger and CacheManager
    using CreatorCodex.AI.IdentitySecurityAdvisor; // AI model integration

    namespace CreatorCodex.Services.HallOfFaces
    {
        public class AzureAdManagerException : Exception
        {
            public AzureAdManagerException(string message, Exception innerException = null) : base(message, innerException) { }
        }

        public class AzureAdManager
        {
            private readonly GraphServiceClient _graphClient;
            private readonly ILogger<AzureAdManager> _logger;
            private readonly ICacheManager _cacheManager;
            private readonly IIdentitySecurityAdvisor _securityAdvisor; // Changed to interface for consistency

            public AzureAdManager(IConfiguration configuration, ILogger<AzureAdManager> logger, ICacheManager cacheManager, IIdentitySecurityAdvisor securityAdvisor)
            {
                _logger = logger;
                _cacheManager = cacheManager;
                _securityAdvisor = securityAdvisor;

                // Client credentials flow for application permissions
                var tenantId = configuration["AzureAd:TenantId"];
                var clientId = configuration["AzureAd:ClientId"];
                var clientSecret = configuration["AzureAd:ClientSecret"]; // Or certificate

                if (string.IsNullOrEmpty(tenantId) || string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
                {
                    _logger.LogError("Azure AD configuration is incomplete. TenantId, ClientId, and ClientSecret are required.");
                    throw new AzureAdManagerException("Azure AD configuration error.");
                }

                var options = new ClientSecretCredentialOptions
                {
                    AuthorityHost = AzureAuthorityHosts.AzurePublicCloud
                };

                // https://docs.microsoft.com/dotnet/api/azure.identity.clientsecretcredential
                var clientSecretCredential = new ClientSecretCredential(
                    tenantId, clientId, clientSecret, options);

                _graphClient = new GraphServiceClient(clientSecretCredential);
                _logger.LogInformation("AzureAdManager initialized with GraphServiceClient.");
            }

            public async Task<User> GetUserByIdAsync(string userId)
            {
                var cacheKey = $"azure_ad_user_{userId}";
                var cachedUser = await _cacheManager.GetAsync<User>(cacheKey);
                if (cachedUser != null)
                {
                    _logger.LogDebug($"Serving user {userId} from cache.");
                    return cachedUser;
                }

                _logger.LogInformation($"Fetching Azure AD user by ID: {userId}");
                try
                {
                    var user = await _graphClient.Users[userId].Request().GetAsync();
                    await _cacheManager.SetAsync(cacheKey, user, TimeSpan.FromMinutes(5));
                    return user;
                }
                catch (ServiceException ex)
                {
                    _logger.LogError(ex, $"Error fetching user {userId} from Azure AD: {ex.Message}");
                    throw new AzureAdManagerException($"Failed to get user {userId}.", ex);
                }
            }

            public async Task<IEnumerable<User>> ListUsersAsync(int top = 100, string filter = null)
            {
                _logger.LogInformation($"Listing Azure AD users (top: {top}, filter: '{filter ?? "none"}')...");
                var cacheKey = $"azure_ad_users_t{top}_f{filter?.Replace(" ", "_") ?? "all"}";
                var cachedUsers = await _cacheManager.GetAsync<IEnumerable<User>>(cacheKey);
                if (cachedUsers != null)
                {
                    _logger.LogDebug($"Serving users from cache for {cacheKey}.");
                    return cachedUsers;
                }

                try
                {
                    var usersQuery = _graphClient.Users.Request().Top(top).Select(u => new { u.Id, u.DisplayName, u.Mail, u.AccountEnabled, u.SignInActivity, u.City, u.Country });
                    if (!string.IsNullOrEmpty(filter))
                    {
                        usersQuery.Filter(filter);
                    }

                    var pagedUsers = await usersQuery.GetAsync();
                    var allUsers = new List<User>();
                    while (pagedUsers != null)
                    {
                        allUsers.AddRange(pagedUsers.CurrentPage);
                        if (pagedUsers.NextPageRequest != null)
                        {
                            pagedUsers = await pagedUsers.NextPageRequest.GetAsync();
                        }
                        else
                        {
                            break;
                        }
                    }

                    // AI Integration: Analyze sign-in activity and assess risk
                    foreach (var user in allUsers)
                    {
                        var lastSignInDateTime = user.SignInActivity?.LastSignInDateTime;
                        var lastSignInLocation = user.City ?? user.Country ?? "unknown"; // Using City/Country as proxy for location

                        if (lastSignInDateTime.HasValue)
                        {
                            var isAnomalousLogin = await _securityAdvisor.AnalyzeLoginPattern(user.Id, lastSignInDateTime.Value.UtcDateTime, lastSignInLocation);
                            if (isAnomalousLogin)
                            {
                                // In a real system, this might update a custom extension attribute or raise a security event
                                _logger.LogWarning($"Security Alert: Anomalous login for Azure AD user {user.Id} ({user.DisplayName}).");
                            }
                        }
                        // Add AI-driven risk score to user object (conceptually)
                        // user.AdditionalData["riskScore"] = await _securityAdvisor.AssessUserRisk(user.Id, user);
                    }

                    await _cacheManager.SetAsync(cacheKey, allUsers, TimeSpan.FromMinutes(1));
                    return allUsers;
                }
                catch (ServiceException ex)
                {
                    _logger.LogError(ex, $"Error listing users from Azure AD: {ex.Message}");
                    throw new AzureAdManagerException($"Failed to list users.", ex);
                }
            }

            public async Task<User> CreateUserAsync(string displayName, string email, string password, bool accountEnabled = true)
            {
                _logger.LogInformation($"Creating new Azure AD user: {displayName} ({email})");
                var newUser = new User
                {
                    AccountEnabled = accountEnabled,
                    DisplayName = displayName,
                    MailNickname = email.Split('@')[0], // Typically derived from email
                    UserPrincipalName = email,
                    PasswordProfile = new PasswordProfile
                    {
                        ForceChangePasswordNextSignIn = true,
                        Password = password
                    },
                    Identities = new List<ObjectIdentity> // Example for federation/external IDs
                    {
                        new ObjectIdentity { SignInType = "userName", Issuer = "contoso.com", IssuerAssignedId = email.Split('@')[0] }
                    }
                };

                try
                {
                    var createdUser = await _graphClient.Users.Request().AddAsync(newUser);
                    _logger.LogInformation($"Azure AD user {createdUser.Id} ({createdUser.DisplayName}) created successfully.");
                    await _securityAdvisor.LogUserAction(createdUser.Id, "create", "successful");
                    return createdUser;
                }
                catch (ServiceException ex)
                {
                    _logger.LogError(ex, $"Error creating user {email} in Azure AD: {ex.Message}");
                    throw new AzureAdManagerException($"Failed to create user {email}.", ex);
                }
            }

            public async Task BlockUserAsync(string userId)
            {
                _logger.LogWarning($"Attempting to block Azure AD user: {userId}. Initiating security audit.");
                try
                {
                    var userToUpdate = new User { AccountEnabled = false };
                    await _graphClient.Users[userId].Request().UpdateAsync(userToUpdate);
                    _logger.LogInformation($"Successfully blocked Azure AD user: {userId}.");
                    await _cacheManager.RemoveAsync($"azure_ad_user_{userId}");
                    await _securityAdvisor.LogUserAction(userId, "block", "successful");
                }
                catch (ServiceException ex)
                {
                    _logger.LogError(ex, $"Error blocking user {userId} in Azure AD: {ex.Message}");
                    throw new AzureAdManagerException($"Failed to block user {userId}.", ex);
                }
            }

            public async Task UnblockUserAsync(string userId)
            {
                _logger.LogInformation($"Attempting to unblock Azure AD user: {userId}.");
                try
                {
                    var userToUpdate = new User { AccountEnabled = true };
                    await _graphClient.Users[userId].Request().UpdateAsync(userToUpdate);
                    _logger.LogInformation($"Successfully unblocked Azure AD user: {userId}.");
                    await _cacheManager.RemoveAsync($"azure_ad_user_{userId}");
                    await _securityAdvisor.LogUserAction(userId, "unblock", "successful");
                }
                catch (ServiceException ex)
                {
                    _logger.LogError(ex, $"Error unblocking user {userId} in Azure AD: {ex.Message}");
                    throw new AzureAdManagerException($"Failed to unblock user {userId}.", ex);
                }
            }

            public async Task AddUserToGroupAsync(string userId, string groupId)
            {
                _logger.LogInformation($"Adding user {userId} to group {groupId}.");
                try
                {
                    var directoryObject = new DirectoryObject
                    {
                        Id = userId
                    };
                    await _graphClient.Groups[groupId].Members.References.Request().AddAsync(directoryObject);
                    _logger.LogInformation($"User {userId} added to group {groupId} successfully.");
                    await _securityAdvisor.LogUserAction(userId, "add_to_group", "successful", new { groupId });
                }
                catch (ServiceException ex)
                {
                    _logger.LogError(ex, $"Error adding user {userId} to group {groupId}: {ex.Message}");
                    throw new AzureAdManagerException($"Failed to add user {userId} to group {groupId}.", ex);
                }
            }

            public async Task RemoveUserFromGroupAsync(string userId, string groupId)
            {
                _logger.LogInformation($"Removing user {userId} from group {groupId}.");
                try
                {
                    await _graphClient.Groups[groupId].Members[userId].Reference.Request().DeleteAsync();
                    _logger.LogInformation($"User {userId} removed from group {groupId} successfully.");
                    await _securityAdvisor.LogUserAction(userId, "remove_from_group", "successful", new { groupId });
                }
                catch (ServiceException ex)
                {
                    _logger.LogError(ex, $"Error removing user {userId} from group {groupId}: {ex.Message}");
                    throw new AzureAdManagerException($"Failed to remove user {userId} from group {groupId}.", ex);
                }
            }

            public async Task<IEnumerable<Group>> ListUserGroupsAsync(string userId)
            {
                _logger.LogInformation($"Listing groups for user {userId}.");
                var cacheKey = $"azure_ad_user_groups_{userId}";
                var cachedGroups = await _cacheManager.GetAsync<IEnumerable<Group>>(cacheKey);
                if (cachedGroups != null)
                {
                    _logger.LogDebug($"Serving groups for user {userId} from cache.");
                    return cachedGroups;
                }

                try
                {
                    var groups = await _graphClient.Users[userId].MemberOf.Request().GetAsync();
                    var allGroups = new List<Group>();
                    while (groups != null)
                    {
                        foreach (var directoryObject in groups.CurrentPage)
                        {
                            if (directoryObject is Group group)
                            {
                                allGroups.Add(group);
                            }
                        }
                        if (groups.NextPageRequest != null)
                        {
                            groups = await groups.NextPageRequest.GetAsync();
                        }
                        else
                        {
                            break;
                        }
                    }
                    await _cacheManager.SetAsync(cacheKey, allGroups, TimeSpan.FromMinutes(5));
                    return allGroups;
                }
                catch (ServiceException ex)
                {
                    _logger.LogError(ex, $"Error listing groups for user {userId}: {ex.Message}");
                    throw new AzureAdManagerException($"Failed to list user groups.", ex);
                }
            }
        }
    }
    ```

---

## 3. Storage Module: The Great Library - Data Repository Sovereignty
### Core Concept
Imagine The Great Library, not merely as a vast archive, but as a sage guardian, meticulously curating and preserving the collective wisdom and stories of an entire enterprise. This module is envisioned as the ultimate, intelligent data repository management system, abstracting the complexities of disparate cloud storage solutions into a unified, high-performance, and deeply insightful platform. It provides a sovereign browser for all organizational data objects, irrespective of their underlying cloud provider (AWS S3, GCP Cloud Storage, Azure Blob Storage). Beyond simple file operations, it offers advanced data lifecycle management, automated classification, intelligent tiering recommendations, and real-time compliance validation, ensuring that data is stored optimally, securely, and in accordance with global regulations. This module transforms raw storage into a strategic asset, ensuring that each datum, a story, each collection, a chapter, is poised to unfold its full potential for future generations.

### Key API Integrations and Strategic Expansion

#### a. Google Cloud Storage SDK (`@google-cloud/storage`)
-   **Purpose:** To orchestrate comprehensive management of objects within Google Cloud Storage buckets, including listing, uploading, downloading, deleting, moving, and managing metadata and access controls. This is the careful hand that organizes and safeguards every manuscript.
-   **Architectural Approach:** A dedicated Storage Gateway Service (SGS) acts as the secure intermediary, abstracting direct SDK calls from the client. This service, typically deployed within a secure network boundary, leverages GCP Service Accounts with least-privilege roles. All operations are rate-limited, audited, and logged. For large file transfers, the SGS can generate pre-signed URLs, allowing clients secure, temporary direct access without exposing credentials. AI/ML models are integrated to analyze data types, access patterns, and retention policies, providing automated suggestions for intelligent tiering (e.g., Standard, Nearline, Coldline, Archive) and anomaly detection for unusual data access, much like a seasoned archivist who intuitively knows where each piece of knowledge belongs.
-   **Code Examples:**
    -   **TypeScript (Backend API - Comprehensive GCP Cloud Storage Operations with AI Integration):**
        ```typescript
        // api/great_library/gcp_storage_routes.ts
        import { Storage, TransferManager } from '@google-cloud/storage';
        import { Request, Response, NextFunction } from 'express'; // Assuming an Express.js server context
        import { z } from 'zod';
        import { config } from 'dotenv';
        import { logger } from '../utils/logger';
        import { cache } from '../utils/cache_manager';
        import { aiDataIntelligence } from '../ai/data_intelligence_engine'; // AI model integration

        config();

        // Environment variables for configuration
        const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
        const DEFAULT_GCP_BUCKET = process.env.GCP_DEFAULT_BUCKET || 'demobank-datalake-prod';

        if (!GCP_PROJECT_ID) {
          logger.error("GCP_PROJECT_ID environment variable is not set.");
          throw new Error("GCP_PROJECT_ID is required for Google Cloud Storage integration.");
        }

        const storage = new Storage({ projectId: GCP_PROJECT_ID });
        // TransferManager would be used for complex, large-scale concurrent transfers.
        // For basic operations, direct file methods are often sufficient.
        // const transferManager = new TransferManager(storage.bucket(DEFAULT_GCP_BUCKET)); // For parallel uploads/downloads

        export interface FileMetadata {
          name: string;
          size: string; // Represented as string for large numbers
          updated: string;
          contentType: string;
          storageClass: string;
          owner?: string;
          tags?: Record<string, string>;
          ai_classification?: string; // AI-driven data classification (e.g., PII, sensitive, public)
          ai_tiering_suggestion?: 'STANDARD' | 'NEARLINE' | 'COLDLINE' | 'ARCHIVE';
          ai_security_alerts?: string[]; // AI-driven security alerts
          ai_compliance_status?: string; // AI-driven compliance status (e.g., 'compliant', 'non-compliant', 'pending_review')
        }

        // Zod schema for input validation
        const fileUploadSchema = z.object({
          filename: z.string().min(1, "Filename cannot be empty."),
          contentType: z.string().optional(),
          metadata: z.record(z.string(), z.string()).optional(),
        });

        // Middleware to safely get bucket name
        const getBucketName = (req: Request): string => {
          return req.params.bucketName || DEFAULT_GCP_BUCKET;
        };

        /**
         * Lists files within a specified Google Cloud Storage bucket.
         * Includes AI-driven insights for each file, like a curator providing context for each artifact.
         * @param req Express request object (can contain bucketName in params)
         * @param res Express response object
         */
        export async function listFilesRoute(req: Request, res: Response) {
          const bucketName = getBucketName(req);
          const prefix = req.query.prefix as string || ''; // Filter by prefix
          const cacheKey = `gcp_files_list_${bucketName}_${prefix}`;
          const cachedFiles = await cache.get<FileMetadata[]>(cacheKey);

          if (cachedFiles) {
            logger.debug(`Serving files list from cache for bucket: ${bucketName}, prefix: ${prefix}`);
            return res.json(cachedFiles);
          }

          logger.info(`Listing files in bucket: ${bucketName} with prefix: ${prefix}`);
          try {
            const [files] = await storage.bucket(bucketName).getFiles({ prefix: prefix });
            const fileDetails: FileMetadata[] = [];

            for (const file of files) {
              const [metadata] = await file.getMetadata();
              // AI-driven analysis for data classification, tiering, security, and compliance
              const aiClassification = await aiDataIntelligence.classifyData(file.name, metadata);
              const aiTieringSuggestion = await aiDataIntelligence.recommendTiering(file.name, metadata, metadata.storageClass);
              const aiSecurityAlerts = await aiDataIntelligence.scanForSecurityRisks(file.name, metadata);
              const aiComplianceStatus = await aiDataIntelligence.assessCompliance(file.name, metadata, aiClassification);

              fileDetails.push({
                name: file.name,
                size: metadata.size, // GCS size is a string
                updated: metadata.updated,
                contentType: metadata.contentType || 'application/octet-stream',
                storageClass: metadata.storageClass,
                owner: metadata.owner?.entity,
                tags: metadata.metadata, // Custom metadata
                ai_classification: aiClassification,
                ai_tiering_suggestion: aiTieringSuggestion,
                ai_security_alerts: aiSecurityAlerts.length > 0 ? aiSecurityAlerts : undefined,
                ai_compliance_status: aiComplianceStatus,
              });
            }
            await cache.set(cacheKey, fileDetails, 300); // Cache for 5 minutes
            logger.info(`Successfully listed ${fileDetails.length} files for bucket ${bucketName}.`);
            res.json(fileDetails);
          } catch (error) {
            logger.error(`ERROR listing files in bucket ${bucketName}: ${(error as Error).message}`, { error });
            res.status(500).send(`Failed to list files in bucket ${bucketName}.`);
          }
        }

        /**
         * Generates a signed URL for secure, temporary file upload.
         * A temporary key to entrust a new entry into the library.
         * @param req Express request object (expects filename in body)
         * @param res Express response object
         */
        export async function generateSignedUploadUrlRoute(req: Request, res: Response) {
          const bucketName = getBucketName(req);
          const { filename, contentType, metadata } = fileUploadSchema.parse(req.body);

          logger.info(`Generating signed URL for upload to ${filename} in bucket ${bucketName}`);
          const options = {
            version: 'v4' as const, // Use v4 for better security and longer expiry
            action: 'write' as const,
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            contentType: contentType || 'application/octet-stream',
            extensionHeaders: metadata ? Object.entries(metadata).reduce((acc, [key, value]) => ({ ...acc, [`x-goog-meta-${key}`]: value }), {}) : undefined,
          };

          try {
            const [url] = await storage.bucket(bucketName).file(filename).getSignedUrl(options);
            logger.info(`Signed upload URL generated for ${filename}.`);
            aiDataIntelligence.logDataAction(filename, "generate_upload_url", "successful", { bucket: bucketName, metadata });
            res.json({ url, filename });
          } catch (error) {
            logger.error(`ERROR generating signed upload URL for ${filename}: ${(error as Error).message}`, { error });
            aiDataIntelligence.logDataAction(filename, "generate_upload_url", "failed", { bucket: bucketName, errorMessage: (error as Error).message });
            res.status(500).send(`Failed to generate signed URL for ${filename}.`);
          }
        }

        /**
         * Initiates a file download. Generates a signed URL for direct download.
         * Providing temporary access to a specific volume of knowledge.
         * @param req Express request object (expects filename in params)
         * @param res Express response object
         */
        export async function generateSignedDownloadUrlRoute(req: Request, res: Response) {
          const bucketName = getBucketName(req);
          const { filename } = req.params;

          if (!filename) {
            return res.status(400).send('Filename is required for download.');
          }

          logger.info(`Generating signed URL for download of ${filename} from bucket ${bucketName}`);
          const options = {
            version: 'v4' as const,
            action: 'read' as const,
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
          };

          try {
            const [url] = await storage.bucket(bucketName).file(filename).getSignedUrl(options);
            logger.info(`Signed download URL generated for ${filename}.`);
            aiDataIntelligence.logDataAction(filename, "generate_download_url", "successful", { bucket: bucketName });
            res.json({ url, filename });
          } catch (error) {
            logger.error(`ERROR generating signed download URL for ${filename}: ${(error as Error).message}`, { error });
            aiDataIntelligence.logDataAction(filename, "generate_download_url", "failed", { bucket: bucketName, errorMessage: (error as Error).message });
            res.status(500).send(`Failed to generate signed URL for ${filename}.`);
          }
        }

        /**
         * Deletes a file from a specified Google Cloud Storage bucket.
         * A careful, irreversible act of removing a document no longer needed.
         * @param req Express request object (expects filename in params)
         * @param res Express response object
         */
        export async function deleteFileRoute(req: Request, res: Response) {
          const bucketName = getBucketName(req);
          const { filename } = req.params;

          if (!filename) {
            return res.status(400).send('Filename is required for deletion.');
          }

          logger.warn(`Attempting to delete file: ${filename} from bucket ${bucketName}.`);
          try {
            await storage.bucket(bucketName).file(filename).delete();
            logger.info(`File ${filename} deleted successfully from bucket ${bucketName}.`);
            await cache.delete(`gcp_files_list_${bucketName}_*`); // Invalidate cache
            aiDataIntelligence.logDataAction(filename, "delete", "successful", { bucket: bucketName });
            res.status(204).send(); // No Content
          } catch (error) {
            logger.error(`ERROR deleting file ${filename}: ${(error as Error).message}`, { error });
            aiDataIntelligence.logDataAction(filename, "delete", "failed", { bucket: bucketName, errorMessage: (error as Error).message });
            res.status(500).send(`Failed to delete file ${filename}.`);
          }
        }

        /**
         * Moves/renames a file within a Google Cloud Storage bucket.
         * Like meticulously relocating a manuscript to its proper new section.
         * @param req Express request object (expects oldPath and newPath in body)
         * @param res Express response object
         */
        export async function moveFileRoute(req: Request, res: Response) {
          const bucketName = getBucketName(req);
          const { oldPath, newPath } = req.body;

          if (!oldPath || !newPath) {
            return res.status(400).send('Old path and new path are required for moving a file.');
          }

          logger.info(`Moving file from ${oldPath} to ${newPath} in bucket ${bucketName}.`);
          try {
            await storage.bucket(bucketName).file(oldPath).move(storage.bucket(bucketName).file(newPath));
            logger.info(`File moved from ${oldPath} to ${newPath} successfully.`);
            await cache.delete(`gcp_files_list_${bucketName}_*`); // Invalidate cache
            aiDataIntelligence.logDataAction(oldPath, "move", "successful", { newPath, bucket: bucketName });
            res.status(200).json({ message: 'File moved successfully', oldPath, newPath });
          } catch (error) {
            logger.error(`ERROR moving file from ${oldPath} to ${newPath}: ${(error as Error).message}`, { error });
            aiDataIntelligence.logDataAction(oldPath, "move", "failed", { newPath, bucket: bucketName, errorMessage: (error as Error).message });
            res.status(500).send(`Failed to move file.`);
          }
        }

        /**
         * Updates the storage class of a file based on AI recommendations.
         * Adjusting the shelf life of a document based on its wisdom and relevance.
         * @param req Express request object (expects filename and newStorageClass in body)
         * @param res Express response object
         */
        export async function updateFileStorageClassRoute(req: Request, res: Response) {
          const bucketName = getBucketName(req);
          const { filename, newStorageClass } = req.body;

          if (!filename || !newStorageClass) {
            return res.status(400).send('Filename and newStorageClass are required.');
          }

          logger.info(`Updating storage class for file ${filename} in bucket ${bucketName} to ${newStorageClass}.`);
          try {
            const file = storage.bucket(bucketName).file(filename);
            await file.setStorageClass(newStorageClass);
            logger.info(`Storage class for ${filename} updated to ${newStorageClass}.`);
            await cache.delete(`gcp_files_list_${bucketName}_*`); // Invalidate cache
            aiDataIntelligence.logDataAction(filename, "storage_class_change", "successful", { bucket: bucketName, newClass: newStorageClass });
            res.status(200).json({ message: 'Storage class updated successfully', filename, newStorageClass });
          } catch (error) {
            logger.error(`ERROR updating storage class for file ${filename}: ${(error as Error).message}`, { error });
            aiDataIntelligence.logDataAction(filename, "storage_class_change", "failed", { bucket: bucketName, newClass: newStorageClass, errorMessage: (error as Error).message });
            res.status(500).send(`Failed to update storage class.`);
          }
        }

        // Example of an Express router setup (if this file were integrated as routes)
        /*
        import express from 'express';
        export const storageRouter = express.Router();
        storageRouter.get('/buckets/:bucketName/files', listFilesRoute);
        storageRouter.post('/buckets/:bucketName/files/signed-upload-url', generateSignedUploadUrlRoute);
        storageRouter.get('/buckets/:bucketName/files/:filename/signed-download-url', generateSignedDownloadUrlRoute);
        storageRouter.delete('/buckets/:bucketName/files/:filename', deleteFileRoute);
        storageRouter.post('/buckets/:bucketName/files/move', moveFileRoute);
        storageRouter.patch('/buckets/:bucketName/files/storage-class', updateFileStorageClassRoute);
        */
        ```

#### b. AWS S3 SDK (`@aws-sdk/client-s3`)
-   **Purpose:** To provide equivalent functionality for S3 buckets, ensuring parity in data management capabilities across multi-cloud storage environments. This mirrors the meticulous care given to every volume within The Great Library, regardless of its origin.
-   **Architectural Approach:** A parallel component within the SGS will utilize the AWS SDK for S3 operations. This includes multipart uploads, object versioning control, lifecycle policy management, and integration with S3's native data classification (e.g., Macie) for a combined AI-driven data intelligence layer. This dual approach ensures that every piece of information, whether on GCP or AWS, is managed with consistent wisdom and efficiency.
-   **Code Examples (Conceptual Python - AWS S3 Operations):**
    ```python
    # services/great_library/aws_s3_manager.py
    import boto3
    import os
    from datetime import datetime, timedelta
    from typing import List, Dict, Any, Optional

    from dotenv import load_dotenv
    from src.utils.logger import logger
    from src.utils.cache_manager import cache
    from src.ai.data_intelligence_engine import DataIntelligenceEngine # AI model integration

    load_dotenv()

    AWS_REGION: str = os.environ.get("AWS_REGION", "us-east-1")
    DEFAULT_S3_BUCKET: str = os.environ.get("AWS_DEFAULT_S3_BUCKET", "demobank-datalake-prod-s3")

    class AwsS3ManagerException(Exception):
        pass

    class AwsS3Manager:
        _instance = None

        def __new__(cls):
            if cls._instance is None:
                cls._instance = super(AwsS3Manager, cls).__new__(cls)
                cls._instance._s3_client = boto3.client('s3', region_name=AWS_REGION)
                cls._instance._s3_resource = boto3.resource('s3', region_name=AWS_REGION) # For higher-level ops
                logger.info("AwsS3Manager initialized.")
            return cls._instance

        async def _get_bucket_tags(self, bucket_name: str) -> Dict[str, str]:
            """Helper to get bucket tags, revealing context embedded within the data's container."""
            try:
                response = self._s3_client.get_bucket_tagging(Bucket=bucket_name)
                return {tag['Key']: tag['Value'] for tag in response['TagSet']}
            except self._s3_client.exceptions.NoSuchTagSet:
                return {}
            except Exception as e:
                logger.warning(f"Could not fetch tags for bucket {bucket_name}: {e}")
                return {}

        async def list_objects(self, bucket_name: str = DEFAULT_S3_BUCKET, prefix: str = '') -> List[Dict[str, Any]]:
            """Lists objects in an S3 bucket with AI insights, like cataloging every scroll and codex."""
            cache_key = f"s3_objects_list_{bucket_name}_{prefix}"
            cached_data = await cache.get(cache_key)
            if cached_data:
                logger.debug(f"Serving S3 object list from cache for {cache_key}.")
                return cached_data

            logger.info(f"Listing objects in S3 bucket: {bucket_name} with prefix: {prefix}")
            objects_list: List[Dict[str, Any]] = []
            try:
                paginator = self._s3_client.get_paginator('list_objects_v2')
                pages = paginator.paginate(Bucket=bucket_name, Prefix=prefix)
                for page in pages:
                    for obj in page.get('Contents', []):
                        if 'Key' in obj:
                            # Fetch full metadata for AI analysis (can be performance intensive for many objects)
                            # For production, consider optimizing this or performing async background processing.
                            try:
                                head_object_response = self._s3_client.head_object(Bucket=bucket_name, Key=obj['Key'])
                                metadata = head_object_response.get('Metadata', {})
                                content_type = head_object_response.get('ContentType', 'application/octet-stream')
                                storage_class = head_object_response.get('StorageClass', 'STANDARD')

                                # AI-driven analysis
                                ai_classification = await DataIntelligenceEngine.classify_data(obj['Key'], metadata)
                                ai_tiering_suggestion = await DataIntelligenceEngine.recommend_tiering(obj['Key'], metadata, current_storage_class=storage_class)
                                ai_security_alerts = await DataIntelligenceEngine.scan_for_security_risks(obj['Key'], metadata)
                                ai_compliance_status = await DataIntelligenceEngine.assess_compliance(obj['Key'], metadata, ai_classification)

                                objects_list.append({
                                    "name": obj['Key'],
                                    "size": obj['Size'],
                                    "last_modified": obj['LastModified'].isoformat(),
                                    "etag": obj['ETag'],
                                    "storage_class": storage_class,
                                    "content_type": content_type,
                                    "metadata": metadata,
                                    "ai_classification": ai_classification,
                                    "ai_tiering_suggestion": ai_tiering_suggestion,
                                    "ai_security_alerts": ai_security_alerts if ai_security_alerts else None,
                                    "ai_compliance_status": ai_compliance_status,
                                })
                            except Exception as metadata_error:
                                logger.warning(f"Could not get detailed metadata for {obj['Key']}: {metadata_error}")
                                objects_list.append({
                                    "name": obj['Key'],
                                    "size": obj['Size'],
                                    "last_modified": obj['LastModified'].isoformat(),
                                    "etag": obj['ETag'],
                                    "storage_class": "UNKNOWN",
                                    "content_type": "UNKNOWN",
                                    "metadata": {},
                                    "ai_classification": "UNCLASSIFIED",
                                    "ai_tiering_suggestion": "STANDARD",
                                    "ai_security_alerts": ["Metadata fetching failed"],
                                    "ai_compliance_status": "UNKNOWN",
                                })

                await cache.set(cache_key, objects_list, ex=300)
                logger.info(f"Successfully listed {len(objects_list)} S3 objects for bucket {bucket_name}.")
                return objects_list
            except Exception as e:
                logger.error(f"Error listing objects in S3 bucket {bucket_name}: {e}", exc_info=True)
                raise AwsS3ManagerException(f"Failed to list S3 objects: {e}")

        async def upload_object(self, bucket_name: str, key: str, file_path: str, metadata: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
            """Uploads a file to an S3 bucket, placing a new tome upon its shelf."""
            logger.info(f"Uploading file {file_path} to S3 bucket {bucket_name} as {key}.")
            try:
                extra_args = {'Metadata': metadata} if metadata else {}
                self._s3_client.upload_file(file_path, bucket_name, key, ExtraArgs=extra_args)
                logger.info(f"File {key} uploaded successfully to {bucket_name}.")
                await cache.delete(f"s3_objects_list_{bucket_name}_*")
                await DataIntelligenceEngine.log_data_action(key, "upload", "successful", {"bucket": bucket_name, "metadata": metadata})
                return {"message": "Upload successful", "key": key}
            except Exception as e:
                logger.error(f"Error uploading file {key} to S3: {e}", exc_info=True)
                await DataIntelligenceEngine.log_data_action(key, "upload", "failed", {"bucket": bucket_name, "errorMessage": str(e)})
                raise AwsS3ManagerException(f"Failed to upload object: {e}")

        async def download_object(self, bucket_name: str, key: str, download_path: str) -> Dict[str, Any]:
            """Downloads an object from an S3 bucket, borrowing a volume for study."""
            logger.info(f"Downloading object {key} from S3 bucket {bucket_name} to {download_path}.")
            try:
                self._s3_client.download_file(bucket_name, key, download_path)
                logger.info(f"Object {key} downloaded successfully to {download_path}.")
                await DataIntelligenceEngine.log_data_action(key, "download", "successful", {"bucket": bucket_name, "path": download_path})
                return {"message": "Download successful", "key": key, "path": download_path}
            except Exception as e:
                logger.error(f"Error downloading object {key} from S3: {e}", exc_info=True)
                await DataIntelligenceEngine.log_data_action(key, "download", "failed", {"bucket": bucket_name, "errorMessage": str(e)})
                raise AwsS3ManagerException(f"Failed to download object: {e}")

        async def delete_object(self, bucket_name: str, key: str) -> Dict[str, Any]:
            """Deletes an object from an S3 bucket, a considered act of removing obsolete records."""
            logger.warning(f"Deleting object {key} from S3 bucket {bucket_name}.")
            try:
                self._s3_client.delete_object(Bucket=bucket_name, Key=key)
                logger.info(f"Object {key} deleted successfully from {bucket_name}.")
                await cache.delete(f"s3_objects_list_{bucket_name}_*")
                await DataIntelligenceEngine.log_data_action(key, "delete", "successful", {"bucket": bucket_name})
                return {"message": "Deletion successful", "key": key}
            except Exception as e:
                logger.error(f"Error deleting object {key} from S3: {e}", exc_info=True)
                await DataIntelligenceEngine.log_data_action(key, "delete", "failed", {"bucket": bucket_name, "errorMessage": str(e)})
                raise AwsS3ManagerException(f"Failed to delete object: {e}")

        async def generate_presigned_url(self, bucket_name: str, key: str, action: str = 'get_object', expiration: int = 3600) -> str:
            """Generates a presigned URL for an S3 object, providing temporary, secure access."""
            logger.info(f"Generating presigned URL for {action} on {key} in {bucket_name} (expires in {expiration}s).")
            try:
                # 'get_object' for download, 'put_object' for upload
                url = self._s3_client.generate_presigned_url(
                    ClientMethod=action,
                    Params={'Bucket': bucket_name, 'Key': key},
                    ExpiresIn=expiration
                )
                logger.info(f"Presigned URL generated for {key}.")
                await DataIntelligenceEngine.log_data_action(key, "generate_presigned_url", "successful", {"bucket": bucket_name, "action": action, "expiration": expiration})
                return url
            except Exception as e:
                logger.error(f"Error generating presigned URL for {key}: {e}", exc_info=True)
                await DataIntelligenceEngine.log_data_action(key, "generate_presigned_url", "failed", {"bucket": bucket_name, "action": action, "errorMessage": str(e)})
                raise AwsS3ManagerException(f"Failed to generate presigned URL: {e}")

        async def change_storage_class(self, bucket_name: str, key: str, new_storage_class: str) -> Dict[str, Any]:
            """Changes the storage class of an S3 object, often based on AI recommendation, like moving a volume to a more suitable section of the library."""
            logger.info(f"Changing storage class of {key} in {bucket_name} to {new_storage_class}.")
            try:
                # Copying object to itself with new storage class effectively changes it
                self._s3_client.copy_object(
                    Bucket=bucket_name,
                    CopySource={'Bucket': bucket_name, 'Key': key},
                    Key=key,
                    StorageClass=new_storage_class,
                    MetadataDirective='COPY' # Preserve existing metadata
                )
                logger.info(f"Storage class of {key} updated to {new_storage_class}.")
                await cache.delete(f"s3_objects_list_{bucket_name}_*")
                # Trigger re-evaluation by AI after change
                await DataIntelligenceEngine.log_data_action(key, "storage_class_change", "successful", {"new_class": new_storage_class})
                return {"message": "Storage class updated", "key": key, "new_storage_class": new_storage_class}
            except Exception as e:
                logger.error(f"Error changing storage class for {key}: {e}", exc_info=True)
                await DataIntelligenceEngine.log_data_action(key, "storage_class_change", "failed", {"new_class": new_storage_class, "errorMessage": str(e)})
                raise AwsS3ManagerException(f"Failed to change storage class for {key}: {e}")

        async def enable_object_versioning(self, bucket_name: str) -> Dict[str, Any]:
            """Enables versioning for an S3 bucket, ensuring a historical record of every change."""
            logger.info(f"Attempting to enable versioning for S3 bucket: {bucket_name}")
            try:
                self._s3_client.put_bucket_versioning(
                    Bucket=bucket_name,
                    VersioningConfiguration={'Status': 'Enabled'}
                )
                logger.info(f"Versioning successfully enabled for bucket {bucket_name}.")
                await DataIntelligenceEngine.log_data_action(bucket_name, "enable_versioning", "successful")
                return {"message": "Versioning enabled", "bucket": bucket_name}
            except Exception as e:
                logger.error(f"Error enabling versioning for bucket {bucket_name}: {e}", exc_info=True)
                await DataIntelligenceEngine.log_data_action(bucket_name, "enable_versioning", "failed", {"errorMessage": str(e)})
                raise AwsS3ManagerException(f"Failed to enable versioning: {e}")


    aws_s3_manager = AwsS3Manager()
    ```

---

## 4. Compute Module: The Engine Core - Intelligent Workload Orchestration
### Core Concept
The Engine Core, akin to a master conductor guiding a grand orchestra, represents the pinnacle of intelligent workload orchestration. It transforms basic virtual machine management into a proactive, AI-driven compute optimization platform. It provides a unified, real-time control plane for all distributed compute resources—spanning VMs, containers, and serverless functions—across heterogeneous cloud environments. Beyond simple status views, it empowers users with predictive insights for auto-scaling, proactive anomaly detection in performance, automated remediation, and intelligent resource allocation, maximizing efficiency, minimizing operational costs, and ensuring peak performance for critical applications. This module truly embodies the "future of compute," making every workload decision strategically informed, where every note of processing power, every rhythm of data flow, is precisely orchestrated for a magnificent performance.

### Key API Integrations and Strategic Expansion

#### a. Azure SDK (`@azure/arm-compute`, `@azure/identity`, `@azure/arm-monitor`)
-   **Purpose:** To achieve deep integration with Azure's compute ecosystem, enabling granular control over Virtual Machines, Virtual Machine Scale Sets (VMSS), Azure Kubernetes Service (AKS) clusters, and Azure Functions. This includes comprehensive monitoring, power state management, scaling operations, and resource tagging for cost allocation. It is the steady hand that fine-tunes the instruments for optimal harmony.
-   **Architectural Approach:** A robust Compute Orchestration Service (COS), designed for fault tolerance and high throughput, will integrate directly with Azure's Resource Manager and Monitor APIs. Managed Identity (or service principals) will be used for secure, role-based access. The COS will implement real-time metric ingestion from Azure Monitor, feeding an AI-powered predictive scaling engine that recommends or executes autonomous scaling actions. Automation Runbooks or Azure Logic Apps can be triggered for complex remediation workflows, much like a seasoned conductor anticipates and corrects any discord before it disrupts the entire composition.
-   **Code Examples:**
    -   **Go (Backend Service - Advanced Azure VM Management with AI-Driven Scaling Insights):**
        ```go
        // services/engine_core/azure_compute_manager.go
        package engine_core

        import (
            "context"
            "fmt"
            "os"
            "time"
            "strings"

            "github.com/Azure/azure-sdk-for-go/sdk/azcore/to"
            "github.com/Azure/azure-sdk-for-go/sdk/azidentity"
            "github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/compute/armcompute"
            "github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/monitor/armmonitor"
            "github.com/joho/godotenv" // For environment variables
            "go.uber.org/zap" // Structured logging
            "CreatorCodex/src/utils/cache" // Shared caching utility
            "CreatorCodex/src/ai/compute_optimizer" // AI model integration
        )

        var (
            log                  *zap.Logger
            subscriptionID       string
            resourceGroupName    string
        )

        func init() {
            // Load environment variables from .env file
            if err := godotenv.Load(); err != nil {
                // Not fatal, as env vars might be set directly in prod
                fmt.Println("No .env file found or error loading it, proceeding with environment variables.")
            }

            // Initialize structured logger
            var err error
            log, err = zap.NewProduction()
            if err != nil {
                panic(fmt.Sprintf("Failed to initialize logger: %v", err))
            }
            // Ensure logger is synced on exit
            // Note: In real-world applications, defer log.Sync() might be placed in main()
            // to ensure all logs are flushed before the program exits.
            // For a package-level init, this defer might not catch all logs if the app crashes early.
            // For illustration purposes here, it serves to show the intent.
            /*
            defer func() {
                if err := log.Sync(); err != nil && err.Error() != "sync /dev/stderr: invalid argument" {
                    fmt.Printf("Error syncing logger: %v\n", err)
                }
            }()
            */


            subscriptionID = os.Getenv("AZURE_SUBSCRIPTION_ID")
            resourceGroupName = os.Getenv("AZURE_RESOURCE_GROUP") // Default resource group

            if subscriptionID == "" {
                log.Fatal("AZURE_SUBSCRIPTION_ID environment variable is not set.")
            }
            // resourceGroupName can be optional for subscription-wide operations
        }

        // VmStatus represents a comprehensive status of an Azure VM
        type VmStatus struct {
            ID                string                   `json:"id"`
            Name              string                   `json:"name"`
            Location          string                   `json:"location"`
            PowerState        string                   `json:"powerState"`
            ProvisioningState string                   `json:"provisioningState"`
            HardwareProfile   string                   `json:"hardwareProfile"` // e.g., Standard_DS1_v2
            Tags              map[string]*string       `json:"tags"`
            NetworkInterfaces []string                 `json:"networkInterfaces"`
            Disks             []string                 `json:"disks"`
            Metrics           *VmMetrics               `json:"metrics,omitempty"`
            AIScalingInsight  *compute_optimizer.ScalingRecommendation `json:"aiScalingInsight,omitempty"` // AI-driven scaling insight
            AISecurityAlerts  []string                 `json:"aiSecurityAlerts,omitempty"` // AI-driven security alerts
            AIPerformanceRecommendation string         `json:"aiPerformanceRecommendation,omitempty"` // AI-driven performance recommendation
        }

        // VmMetrics holds key performance indicators for a VM
        type VmMetrics struct {
            CPUUtilization float64 `json:"cpuUtilization"` // Percentage
            MemoryUsage    float64 `json:"memoryUsage"`    // Percentage
            DiskIOPs       float64 `json:"diskIOPs"`       // Total IOPS (Read + Write)
            NetworkIn      float64 `json:"networkIn"`      // Bytes/second
            NetworkOut     float64 `json:"networkOut"`     // Bytes/second
        }

        // getComputeClient initializes and returns an armcompute.VirtualMachinesClient
        func getComputeClient(ctx context.Context) (*armcompute.VirtualMachinesClient, error) {
            cred, err := azidentity.NewDefaultAzureCredential(nil)
            if err != nil {
                log.Error("Failed to create Azure credential", zap.Error(err))
                return nil, fmt.Errorf("failed to create Azure credential: %w", err)
            }
            client, err := armcompute.NewVirtualMachinesClient(subscriptionID, cred, nil)
            if err != nil {
                log.Error("Failed to create VirtualMachinesClient", zap.Error(err))
                return nil, fmt.Errorf("failed to create VirtualMachinesClient: %w", err)
            }
            return client, nil
        }

        // getMonitorClient initializes and returns an armmonitor.MetricsClient
        func getMonitorClient(ctx context.Context) (*armmonitor.MetricsClient, error) {
            cred, err := azidentity.NewDefaultAzureCredential(nil)
            if err != nil {
                log.Error("Failed to create Azure credential for monitor", zap.Error(err))
                return nil, fmt.Errorf("failed to create Azure credential for monitor: %w", err)
            }
            client, err := armmonitor.NewMetricsClient(subscriptionID, cred, nil) // Metrics client is created with subscription ID
            if err != nil {
                log.Error("Failed to create MetricsClient", zap.Error(err))
                return nil, fmt.Errorf("failed to create MetricsClient: %w", err)
            }
            return client, nil
        }

        // ListVMs provides a comprehensive list of VMs with their status and AI insights.
        // If rgName is empty, it lists VMs across the subscription. Like surveying all the instruments in an orchestra.
        func ListVMs(ctx context.Context, rgName string) ([]VmStatus, error) {
            actualRgName := rgName
            if actualRgName == "" {
                actualRgName = resourceGroupName // Use default if not provided
            }

            cacheKey := fmt.Sprintf("azure_vms_%s", actualRgName)
            if cachedData, found := cache.Get(cacheKey); found {
                log.Debug("Serving VMs from cache", zap.String("resourceGroup", actualRgName))
                return cachedData.([]VmStatus), nil
            }

            log.Info("Listing Azure Virtual Machines", zap.String("resourceGroup", actualRgName))
            client, err := getComputeClient(ctx)
            if err != nil {
                return nil, err
            }

            monitorClient, err := getMonitorClient(ctx)
            if err != nil {
                return nil, err
            }

            vms := make([]VmStatus, 0)
            var pager *armcompute.VirtualMachinesClientListAllPager
            if actualRgName != "" {
                pager = client.NewListPager(actualRgName, nil) // List VMs in a specific resource group
            } else {
                pager = client.NewListAllPager(nil) // List all VMs in the subscription
            }


            for pager.More() {
                page, err := pager.NextPage(ctx)
                if err != nil {
                    log.Error("Failed to list VMs", zap.Error(err))
                    return nil, fmt.Errorf("failed to list VMs: %w", err)
                }

                for _, vm := range page.Value {
                    powerState := "Unknown"
                    provisioningState := "Unknown"
                    if vm.Properties != nil && vm.Properties.InstanceView != nil {
                        for _, status := range vm.Properties.InstanceView.Statuses {
                            if status.Code != nil {
                                if strings.HasPrefix(*status.Code, "PowerState") {
                                    powerState = strings.TrimPrefix(*status.Code, "PowerState/")
                                } else if strings.HasPrefix(*status.Code, "ProvisioningState") {
                                    provisioningState = strings.TrimPrefix(*status.Code, "ProvisioningState/")
                                }
                            }
                        }
                    }

                    networkInterfaces := make([]string, 0)
                    if vm.Properties != nil && vm.Properties.NetworkProfile != nil {
                        for _, nicRef := range vm.Properties.NetworkProfile.NetworkInterfaces {
                            if nicRef.ID != nil {
                                networkInterfaces = append(networkInterfaces, *nicRef.ID)
                            }
                        }
                    }

                    disks := make([]string, 0)
                    if vm.Properties != nil && vm.Properties.StorageProfile != nil && vm.Properties.StorageProfile.DataDisks != nil {
                        for _, disk := range vm.Properties.StorageProfile.DataDisks {
                            if disk.Name != nil {
                                disks = append(disks, *disk.Name)
                            }
                        }
                    }
                    if vm.Properties != nil && vm.Properties.StorageProfile != nil && vm.Properties.StorageProfile.OSDisk != nil && vm.Properties.StorageProfile.OSDisk.Name != nil {
                        disks = append(disks, *vm.Properties.StorageProfile.OSDisk.Name)
                    }

                    vmResourceID := *vm.ID
                    metrics, err := getVmMetrics(ctx, monitorClient, vmResourceID)
                    if err != nil {
                        log.Warn("Failed to get VM metrics", zap.String("vmID", vmResourceID), zap.Error(err))
                    }

                    // AI Integration: Scaling insights and security alerts
                    scalingInsight := compute_optimizer.AnalyzeVmWorkload(vmResourceID, metrics)
                    securityAlerts := compute_optimizer.ScanVmSecurity(vmResourceID, vm.Tags, powerState)
                    performanceRecommendation := compute_optimizer.RecommendVmPerformanceAction(vmResourceID, metrics)

                    vms = append(vms, VmStatus{
                        ID:                vmResourceID,
                        Name:              *vm.Name,
                        Location:          *vm.Location,
                        PowerState:        powerState,
                        ProvisioningState: provisioningState,
                        HardwareProfile:   *vm.Properties.VMSize,
                        Tags:              vm.Tags,
                        NetworkInterfaces: networkInterfaces,
                        Disks:             disks,
                        Metrics:           metrics,
                        AIScalingInsight:  scalingInsight,
                        AISecurityAlerts:  securityAlerts,
                        AIPerformanceRecommendation: performanceRecommendation,
                    })
                }
            }
            cache.Set(cacheKey, vms, 300*time.Second) // Cache for 5 minutes
            log.Info("Successfully listed Azure Virtual Machines", zap.Int("count", len(vms)))
            return vms, nil
        }

        // getVmMetrics fetches CPU and Memory metrics for a given VM.
        // Like taking the pulse of a living system.
        func getVmMetrics(ctx context.Context, monitorClient *armmonitor.MetricsClient, vmResourceID string) (*VmMetrics, error) {
            endTime := time.Now().UTC()
            startTime := endTime.Add(-30 * time.Minute) // Last 30 minutes

            // The monitorClient.NewListPager requires a resourceURI directly, not a subscription ID and resourceType.
            metricsResp, err := monitorClient.NewListPager(
                vmResourceID, // This needs to be the full resource URI of the VM
                &armmonitor.MetricsClientListOptions{
                    Timespan:  to.Ptr(fmt.Sprintf("%s/%s", startTime.Format(time.RFC3339), endTime.Format(time.RFC3339))),
                    Interval:  to.Ptr("PT5M"), // 5-minute aggregation
                    Metricnames: to.Ptr("Percentage CPU,Available Memory Bytes,Disk Read Operations/sec,Disk Write Operations/sec,Network In Total,Network Out Total"),
                    Aggregation: to.Ptr("Average"),
                    ResultType: to.Ptr(armmonitor.ResultTypeData),
                },
            ).NextPage(ctx)


            if err != nil {
                return nil, fmt.Errorf("failed to get VM metrics: %w", err)
            }

            vmMetrics := &VmMetrics{}
            for _, res := range metricsResp.Value {
                if res.Name != nil && res.Name.Value != nil {
                    for _, ts := range res.Timeseries {
                        for _, data := range ts.Data {
                            if data.Average != nil {
                                switch *res.Name.Value {
                                case "Percentage CPU":
                                    vmMetrics.CPUUtilization = *data.Average
                                case "Available Memory Bytes":
                                    // For simplicity, we assume a conversion or just report bytes for now.
                                    // A more complete solution would fetch VM size and calculate %
                                    vmMetrics.MemoryUsage = *data.Average / (1024 * 1024 * 1024) // Convert to GB for reporting
                                case "Disk Read Operations/sec":
                                    vmMetrics.DiskIOPs += *data.Average // Aggregate disk ops
                                case "Disk Write Operations/sec":
                                    vmMetrics.DiskIOPs += *data.Average
                                case "Network In Total":
                                    vmMetrics.NetworkIn = *data.Average
                                case "Network Out Total":
                                    vmMetrics.NetworkOut = *data.Average
                                }
                            }
                        }
                    }
                }
            }
            return vmMetrics, nil
        }


        // StopVM deallocates a specific VM. A thoughtful pause, conserving vital energy.
        func StopVM(ctx context.Context, vmName string) error {
            log.Info("Attempting to stop VM", zap.String("vmName", vmName), zap.String("resourceGroup", resourceGroupName))
            client, err := getComputeClient(ctx)
            if err != nil {
                return err
            }

            poller, err := client.BeginDeallocate(ctx, resourceGroupName, vmName, nil)
            if err != nil {
                log.Error("Failed to initiate VM deallocation", zap.String("vmName", vmName), zap.Error(err))
                return fmt.Errorf("failed to initiate VM deallocation: %w", err)
            }

            _, err = poller.PollUntilDone(ctx, nil)
            if err != nil {
                log.Error("Failed to deallocate VM", zap.String("vmName", vmName), zap.Error(err))
                return fmt.Errorf("failed to deallocate VM: %w", err)
            }

            log.Info("VM deallocated successfully", zap.String("vmName", vmName))
            compute_optimizer.LogVmAction(vmName, "stop", "successful", "Azure", map[string]interface{}{"resourceGroup": resourceGroupName}) // Log for AI
            cache.Delete(fmt.Sprintf("azure_vms_%s", resourceGroupName)) // Invalidate cache
            return nil
        }

        // StartVM starts a specific VM. Awakening a resource to resume its purpose.
        func StartVM(ctx context.Context, vmName string) error {
            log.Info("Attempting to start VM", zap.String("vmName", vmName), zap.String("resourceGroup", resourceGroupName))
            client, err := getComputeClient(ctx)
            if err != nil {
                return err
            }

            poller, err := client.BeginStart(ctx, resourceGroupName, vmName, nil)
            if err != nil {
                log.Error("Failed to initiate VM start", zap.String("vmName", vmName), zap.Error(err))
                return fmt.Errorf("failed to initiate VM start: %w", err)
            }

            _, err = poller.PollUntilDone(ctx, nil)
            if err != nil {
                log.Error("Failed to start VM", zap.String("vmName", vmName), zap.Error(err))
                return fmt.Errorf("failed to start VM: %w", err)
            }

            log.Info("VM started successfully", zap.String("vmName", vmName))
            compute_optimizer.LogVmAction(vmName, "start", "successful", "Azure", map[string]interface{}{"resourceGroup": resourceGroupName}) // Log for AI
            cache.Delete(fmt.Sprintf("azure_vms_%s", resourceGroupName)) // Invalidate cache
            return nil
        }

        // RestartVM restarts a specific VM. A refreshing cycle, invigorating its spirit.
        func RestartVM(ctx context.Context, vmName string) error {
            log.Info("Attempting to restart VM", zap.String("vmName", vmName), zap.String("resourceGroup", resourceGroupName))
            client, err := getComputeClient(ctx)
            if err != nil {
                return err
            }

            poller, err := client.BeginRestart(ctx, resourceGroupName, vmName, nil)
            if err != nil {
                log.Error("Failed to initiate VM restart", zap.String("vmName", vmName), zap.Error(err))
                return fmt.Errorf("failed to initiate VM restart: %w", err)
            }

            _, err = poller.PollUntilDone(ctx, nil)
            if err != nil {
                log.Error("Failed to restart VM", zap.String("vmName", vmName), zap.Error(err))
                return fmt.Errorf("failed to restart VM: %w", err)
            }

            log.Info("VM restarted successfully", zap.String("vmName", vmName))
            compute_optimizer.LogVmAction(vmName, "restart", "successful", "Azure", map[string]interface{}{"resourceGroup": resourceGroupName}) // Log for AI
            cache.Delete(fmt.Sprintf("azure_vms_%s", resourceGroupName)) // Invalidate cache
            return nil
        }

        // ResizeVM changes the size (SKU) of a VM. Like adjusting an instrument to produce a richer sound.
        func ResizeVM(ctx context.Context, vmName, newVmSize string) error {
            log.Info("Attempting to resize VM", zap.String("vmName", vmName), zap.String("newSize", newVmSize))
            client, err := getComputeClient(ctx)
            if err != nil {
                return err
            }

            // A VM must be deallocated to change its size for most SKUs.
            // This example simplifies, but real-world would involve checking current state and deallocating first.
            vm, err := client.Get(ctx, resourceGroupName, vmName, nil)
            if err != nil {
                return fmt.Errorf("failed to get VM %s details: %w", vmName, err)
            }

            if vm.Properties != nil && vm.Properties.InstanceView != nil {
                powerState := "Unknown"
                for _, status := range vm.Properties.InstanceView.Statuses {
                    if status.Code != nil && strings.HasPrefix(*status.Code, "PowerState") {
                        powerState = strings.TrimPrefix(*status.Code, "PowerState/")
                        break
                    }
                }
                if powerState != "Deallocated" && powerState != "Stopped" {
                    log.Warn("VM must be stopped/deallocated to resize, attempting to deallocate first.", zap.String("vmName", vmName))
                    if err := StopVM(ctx, vmName); err != nil {
                        return fmt.Errorf("failed to stop VM %s for resizing: %w", vmName, err)
                    }
                    // Wait for deallocation. In production, this would be a robust polling mechanism.
                    time.Sleep(30 * time.Second)
                }
            }

            oldVmSize := ""
            if vm.Properties != nil && vm.Properties.VMSize != nil {
                oldVmSize = *vm.Properties.VMSize
            }

            updateParams := armcompute.VirtualMachineUpdate{
                Properties: &armcompute.VirtualMachineProperties{
                    VMSize: to.Ptr(newVmSize),
                },
            }

            poller, err := client.BeginUpdate(ctx, resourceGroupName, vmName, updateParams, nil)
            if err != nil {
                log.Error("Failed to initiate VM resize", zap.String("vmName", vmName), zap.String("newSize", newVmSize), zap.Error(err))
                return fmt.Errorf("failed to initiate VM resize: %w", err)
            }

            _, err = poller.PollUntilDone(ctx, nil)
            if err != nil {
                log.Error("Failed to resize VM", zap.String("vmName", vmName), zap.String("newSize", newVmSize), zap.Error(err))
                return fmt.Errorf("failed to resize VM: %w", err)
            }

            log.Info("VM resized successfully", zap.String("vmName", vmName), zap.String("newSize", newVmSize))
            compute_optimizer.LogVmAction(vmName, "resize", "successful", "Azure", map[string]interface{}{"resourceGroup": resourceGroupName, "oldSize": oldVmSize, "newSize": newVmSize}) // Log for AI
            cache.Delete(fmt.Sprintf("azure_vms_%s", resourceGroupName)) // Invalidate cache
            return nil
        }
        ```

#### b. AWS EC2 and ECS SDK (`@aws-sdk/client-ec2`, `@aws-sdk/client-ecs`)
-   **Purpose:** To extend intelligent compute management to AWS resources, including EC2 instances (as shown in Cloud module) and container orchestration within AWS Elastic Container Service (ECS). This ensures that every section of the orchestra, whether string or wind, performs in concert.
-   **Architectural Approach:** The COS will also integrate with AWS EC2 for VM-level operations and with ECS for container workload visibility, task management, and service scaling. This enables a consistent "single pane of glass" for containerized applications, regardless of whether they run on ECS or AKS. AI will provide insights into optimal container sizing, task placement, and predictive scaling based on application performance metrics and cost efficiency, ensuring that the entire composition achieves its intended grandeur.
-   **Code Examples (Conceptual TypeScript - AWS ECS Service Management):**
    ```typescript
    // services/engine_core/aws_ecs_manager.ts
    import { ECSClient, ListServicesCommand, DescribeServicesCommand, UpdateServiceCommand, Service, ListTaskDefinitionsCommand, RegisterTaskDefinitionCommand, TaskDefinition } from "@aws-sdk/client-ecs";
    import { config } from 'dotenv';
    import { logger } from '../utils/logger';
    import { cache } from '../utils/cache_manager';
    import { aiComputeOptimizer } from '../ai/compute_optimizer'; // AI model integration
    import { z } from 'zod'; // For robust input validation

    config();

    const ecsClient = new ECSClient({ region: process.env.AWS_REGION || "us-east-1" });
    const DEFAULT_ECS_CLUSTER = process.env.AWS_DEFAULT_ECS_CLUSTER || 'default-cluster';

    export interface EcsServiceStatus {
      clusterArn: string;
      serviceArn: string;
      serviceName: string;
      status: string;
      desiredCount: number;
      runningCount: number;
      pendingCount: number;
      launchType: string; // EC2 or FARGATE
      createdAt: Date;
      tags: Record<string, string>;
      aiScalingRecommendation?: 'SCALE_UP' | 'SCALE_DOWN' | 'MAINTAIN' | 'OPTIMIZE_COST';
      aiAnomalyAlerts?: string[];
      aiPerformanceRecommendation?: string; // AI-driven performance specific to ECS
    }

    // Zod schema for task definition input for registration
    const taskDefinitionSchema = z.object({
      family: z.string().min(1),
      containerDefinitions: z.array(z.object({
        name: z.string().min(1),
        image: z.string().min(1),
        cpu: z.number().int().positive().optional(),
        memory: z.number().int().positive().optional(),
        essential: z.boolean().default(true),
        portMappings: z.array(z.object({
          containerPort: z.number().int().positive(),
          hostPort: z.number().int().positive().optional(),
          protocol: z.enum(['tcp', 'udp']).default('tcp'),
        })).optional(),
        environment: z.array(z.object({
          name: z.string(),
          value: z.string(),
        })).optional(),
      })),
      networkMode: z.enum(['bridge', 'host', 'awsvpc', 'none']).optional(),
      cpu: z.string().optional(), // For Fargate
      memory: z.string().optional(), // For Fargate
      executionRoleArn: z.string().optional(),
      taskRoleArn: z.string().optional(),
    });

    /**
     * Lists and describes ECS services for a given cluster with AI insights.
     * Like a conductor reviewing the performance of each section of the orchestra.
     * @param clusterName The name of the ECS cluster.
     * @returns Array of EcsServiceStatus.
     */
    export async function listEcsServices(clusterName: string = DEFAULT_ECS_CLUSTER): Promise<EcsServiceStatus[]> {
      const cacheKey = `aws_ecs_services_${clusterName}`;
      const cachedData = await cache.get<EcsServiceStatus[]>(cacheKey);
      if (cachedData) {
        logger.debug(`Serving ECS services from cache for cluster: ${clusterName}`);
        return cachedData;
      }

      logger.info(`Listing ECS services for cluster: ${clusterName}`);
      const serviceArns: string[] = [];
      let nextToken: string | undefined;

      try {
        do {
          const listCommand = new ListServicesCommand({ cluster: clusterName, nextToken: nextToken });
          const listResponse = await ecsClient.send(listCommand);
          serviceArns.push(...(listResponse.serviceArns || []));
          nextToken = listResponse.nextToken;
        } while (nextToken);

        if (serviceArns.length === 0) {
          logger.info(`No ECS services found in cluster: ${clusterName}`);
          return [];
        }

        const describeCommand = new DescribeServicesCommand({ cluster: clusterName, services: serviceArns, include: ['TAGS'] });
        const describeResponse = await ecsClient.send(describeCommand);

        const servicesStatus: EcsServiceStatus[] = [];
        for (const service of describeResponse.services || []) {
          const tags: Record<string, string> = {};
          service.tags?.forEach(tag => {
            if (tag.key && tag.value) {
              tags[tag.key] = tag.value;
            }
          });

          // AI Integration for scaling recommendations, anomaly detection, and performance
          const aiScalingRecommendation = await aiComputeOptimizer.recommendEcsScaling(service);
          const aiAnomalyAlerts = await aiComputeOptimizer.detectEcsAnomalies(service);
          const aiPerformanceRecommendation = await aiComputeOptimizer.recommendEcsPerformanceAction(service);

          servicesStatus.push({
            clusterArn: service.clusterArn!,
            serviceArn: service.serviceArn!,
            serviceName: service.serviceName!,
            status: service.status!,
            desiredCount: service.desiredCount!,
            runningCount: service.runningCount!,
            pendingCount: service.pendingCount!,
            launchType: service.launchType!,
            createdAt: service.createdAt!,
            tags: tags,
            aiScalingRecommendation: aiScalingRecommendation,
            aiAnomalyAlerts: aiAnomalyAlerts.length > 0 ? aiAnomalyAlerts : undefined,
            aiPerformanceRecommendation: aiPerformanceRecommendation,
          });
        }
        await cache.set(cacheKey, servicesStatus, 60); // Cache for 1 minute
        logger.info(`Successfully listed and processed ${servicesStatus.length} ECS services.`);
        return servicesStatus;
      } catch (error) {
        logger.error(`Error listing ECS services for cluster ${clusterName}: ${(error as Error).message}`, { error });
        throw new Error(`Failed to list ECS services: ${(error as Error).message}`);
      }
    }

    /**
     * Updates the desired task count for an ECS service.
     * Like a conductor adjusting the volume of a section to maintain balance.
     * @param clusterName The name of the ECS cluster.
     * @param serviceName The name of the ECS service.
     * @param desiredCount The new desired task count.
     */
    export async function updateEcsServiceDesiredCount(clusterName: string, serviceName: string, desiredCount: number): Promise<Service | undefined> {
      logger.info(`Updating desired task count for ECS service ${serviceName} in cluster ${clusterName} to ${desiredCount}.`);
      try {
        const command = new UpdateServiceCommand({
          cluster: clusterName,
          service: serviceName,
          desiredCount: desiredCount,
        });
        const response = await ecsClient.send(command);
        if (response.service) {
          logger.info(`ECS service ${serviceName} updated to desired count ${desiredCount}.`);
          await cache.delete(`aws_ecs_services_${clusterName}`); // Invalidate cache
          aiComputeOptimizer.logEcsAction(serviceName, clusterName, "update_desired_count", "successful", { newCount: desiredCount });
          return response.service;
        }
        return undefined;
      } catch (error) {
        logger.error(`Error updating ECS service ${serviceName}: ${(error as Error).message}`, { error });
        aiComputeOptimizer.logEcsAction(serviceName, clusterName, "update_desired_count", "failed", { newCount: desiredCount, errorMessage: (error as Error).message });
        throw new Error(`Failed to update ECS service: ${(error as Error).message}`);
      }
    }

    /**
     * Auto-scales an ECS service based on AI recommendations or predefined policies.
     * This function would typically be triggered by an internal event or a scheduled job.
     * Responding to the ebb and flow of demand with grace and foresight.
     * @param clusterName The name of the ECS cluster.
     * @param serviceName The name of the ECS service.
     * @param currentDesiredCount The current desired count of tasks.
     * @param recommendation The AI-driven scaling recommendation.
     */
    export async function autoScaleEcsService(clusterName: string, serviceName: string, currentDesiredCount: number, recommendation: 'SCALE_UP' | 'SCALE_DOWN' | 'MAINTAIN' | 'OPTIMIZE_COST'): Promise<Service | undefined> {
        let newDesiredCount = currentDesiredCount;
        const scaleFactor = 0.2; // 20% increase/decrease

        switch (recommendation) {
            case 'SCALE_UP':
                newDesiredCount = Math.ceil(currentDesiredCount * (1 + scaleFactor));
                logger.info(`AI recommends scaling UP service ${serviceName} to ${newDesiredCount}.`);
                break;
            case 'SCALE_DOWN':
                newDesiredCount = Math.floor(currentDesiredCount * (1 - scaleFactor));
                if (newDesiredCount < 1) newDesiredCount = 1; // Ensure at least one task
                logger.info(`AI recommends scaling DOWN service ${serviceName} to ${newDesiredCount}.`);
                break;
            case 'OPTIMIZE_COST':
                // AI would provide a specific optimized count, e.g., based on historical low utilization
                const optimizedCount = await aiComputeOptimizer.getOptimizedEcsCount(serviceName, clusterName);
                if (optimizedCount < newDesiredCount) {
                    newDesiredCount = optimizedCount;
                    logger.info(`AI recommends cost-optimizing service ${serviceName} to ${newDesiredCount}.`);
                } else {
                    logger.info(`AI determined current count for ${serviceName} is already cost-optimized.`);
                    return undefined;
                }
                break;
            case 'MAINTAIN':
            default:
                logger.info(`AI recommends maintaining current scale for service ${serviceName}.`);
                return undefined; // No change needed
        }

        if (newDesiredCount !== currentDesiredCount) {
            return updateEcsServiceDesiredCount(clusterName, serviceName, newDesiredCount);
        }
        return undefined;
    }

    /**
     * Registers a new task definition or a new revision for an existing task definition.
     * Defining the blueprint for new compositions within the orchestra.
     * @param taskDef The task definition object.
     * @returns The registered TaskDefinition.
     */
    export async function registerEcsTaskDefinition(taskDef: z.infer<typeof taskDefinitionSchema>): Promise<TaskDefinition | undefined> {
      logger.info(`Registering new ECS task definition for family: ${taskDef.family}`);
      try {
        const validatedTaskDef = taskDefinitionSchema.parse(taskDef);
        const command = new RegisterTaskDefinitionCommand(validatedTaskDef);
        const response = await ecsClient.send(command);
        if (response.taskDefinition) {
          logger.info(`Task definition ${response.taskDefinition.taskDefinitionArn} registered successfully.`);
          aiComputeOptimizer.logEcsAction(taskDef.family, 'N/A', "register_task_definition", "successful");
          return response.taskDefinition;
        }
        return undefined;
      } catch (error) {
        logger.error(`Error registering task definition ${taskDef.family}: ${(error as Error).message}`, { error });
        aiComputeOptimizer.logEcsAction(taskDef.family, 'N/A', "register_task_definition", "failed", { errorMessage: (error as Error).message });
        throw new Error(`Failed to register task definition: ${(error as Error).message}`);
      }
    }

    // Export the Zod schema for external validation if needed
    export { taskDefinitionSchema };
    ```

---

## 5. Unified AI & Predictive Intelligence Layer: The Oracle
### Core Concept
And at the heart of it all, The Oracle. It does not command, but whispers wisdom; it does not dictate, but illuminates pathways unseen. The Oracle is not merely an integration point; it is a pervasive, sentient intelligence embedded within every module of the Creator's Codex. It leverages advanced machine learning models, real-time data streams, and historical analytics to provide predictive insights, detect anomalies, automate optimizations, and enhance security posture across the entire digital estate. The Oracle transforms reactive management into proactive, intelligent governance, ensuring maximum efficiency, resilience, and strategic advantage. Like the subtle currents that guide a mighty river, it shapes destiny with foresight, offering guidance without imposing will, fostering a state of harmonious and self-optimizing operation.

### Key Capabilities & Integration Points
-   **Cost Optimization & Forecasting (Aetherium):**
    -   **Predictive cost models** discern future spending trends, flagging potential budget overruns before they manifest, much like reading the shifting winds to foresee a coming storm.
    -   **Anomaly detection algorithms** scrutinize billing data, immediately alerting to unexpected cost spikes or resource misuse, identifying the unseen ripples in the financial waters.
    -   **Intelligent recommendations** for rightsizing of compute instances, intelligent storage tiering, and optimal network configurations, guiding decisions towards fiscal wisdom.
-   **Security & Behavioral Analytics (Hall of Faces):**
    -   **Proactive detection** of anomalous login patterns, unusual user behavior (e.g., access from new locations, rapid role changes), and potential identity compromises, standing as a vigilant guardian at the threshold.
    -   **Real-time risk scores** for user sessions, offering a nuanced understanding of potential vulnerabilities, and recommending adaptive MFA policies, like tailoring a shield to the specific threat.
    -   **Automated identity governance reviews**, identifying stale accounts or over-provisioned permissions, ensuring that every key held has a current, legitimate purpose.
-   **Data Intelligence & Lifecycle Management (Great Library):**
    -   **Automated data classification** (e.g., PII, confidential, public) based on content, tags, and access patterns, accurately labeling each scroll for its true nature and value.
    -   **Intelligent lifecycle policy recommendations** for data retention and archival, optimizing storage costs and compliance, ensuring that knowledge is preserved without undue burden.
    -   **Anomaly detection in data access patterns** (e.g., unusual downloads, deletions, or geographic access) for data loss prevention, guarding against unexpected intrusions into the archives.
-   **Compute Optimization & Auto-Healing (Engine Core):**
    -   **Predictive auto-scaling** of VMs, containers, and serverless functions based on anticipated workload demands, ensuring that the orchestra always has the right number of musicians for the symphony.
    -   **Proactive detection of performance degradation**, suggesting or executing automated remediation (e.g., reboot, resize, re-deploy), maintaining the harmonious flow of the performance.
    -   **Optimal resource placement recommendations**, considering cost, performance, and availability zones, placing each instrument where it can contribute most effectively.
    -   **Automated capacity planning and infrastructure drift detection**, ensuring the stage is always set for future compositions and the ensemble remains perfectly aligned.

### AI Model Examples (Conceptual)
```typescript
// src/ai/cost_forecaster.ts
import { logger } from '../utils/logger';

export const aiPredictiveCostModel = {
  /**
   * Simulates an AI model predicting future cost based on historical data.
   * In a real system, this would involve a trained ML model (e.g., ARIMA, Prophet, or a deep learning model)
   * considering historical trends, seasonality, resource utilization, and macroeconomic factors.
   * Like a seasoned economist forecasting market trends.
   * @param serviceName The name of the cloud service.
   * @param currentCost The current observed cost.
   * @param timePeriod The current time period (e.g., 'YYYY-MM-DD' for daily, or 'YYYY-MM' for monthly).
   * @returns Predicted cost for the next period.
   */
  async predictCost(serviceName: string, currentCost: number, timePeriod: string): Promise<number> {
    logger.debug(`AI Cost Forecaster: Predicting cost for ${serviceName} at ${timePeriod}`);
    // Placeholder: A subtle growth, acknowledging past patterns while accounting for natural fluctuation.
    const baseGrowth = 1.015; // A gentle, underlying growth
    const seasonalityFactor = Math.sin(new Date(timePeriod).getMonth() / 12 * 2 * Math.PI) * 0.05 + 1; // Subtle monthly seasonality
    const noise = (Math.random() - 0.5) * currentCost * 0.03; // Small, inherent unpredictability

    let predicted = currentCost * baseGrowth * seasonalityFactor + noise;
    predicted = Math.max(0, predicted); // Costs should not be negative
    return parseFloat(predicted.toFixed(2));
  },

  /**
   * Simulates an AI model detecting anomalies in cost data.
   * This would typically use statistical process control, time-series anomaly detection,
   * or unsupervised learning algorithms to identify deviations from expected patterns.
   * Like a careful auditor noticing an unexpected entry in the ledger.
   * @param serviceName The name of the cloud service.
   * @param currentCost The current observed cost.
   * @returns True if an anomaly is detected, false otherwise.
   */
  async detectAnomaly(serviceName: string, currentCost: number): Promise<boolean> {
    logger.debug(`AI Cost Forecaster: Detecting anomaly for ${serviceName} with cost ${currentCost}`);
    // Placeholder: Compare current cost to a projected baseline, allowing for a reasonable variance.
    // For demonstration, let's assume a "normal" range is within +/- 20% of the predicted value.
    const baselinePrediction = await this.predictCost(serviceName, currentCost * 0.9, new Date().toISOString()); // A slight backward look to simulate 'expected'
    const deviationThreshold = 0.25; // 25% deviation from baseline
    const isAnomalous = Math.abs(currentCost - baselinePrediction) / baselinePrediction > deviationThreshold;

    if (isAnomalous) {
      logger.warn(`Anomaly detected for ${serviceName}: current cost ${currentCost} deviates significantly from baseline ${baselinePrediction}.`);
    }
    return isAnomalous;
  },

  /**
   * Offers proactive suggestions for optimizing cloud costs.
   * Like a wise elder offering counsel on efficient resource use.
   * @param serviceName The name of the cloud service.
   * @param currentCost The current observed cost.
   * @returns A string detailing the optimization suggestion.
   */
  async suggestCostOptimization(serviceName: string, currentCost: number): Promise<string> {
    logger.debug(`AI Cost Forecaster: Suggesting optimization for ${serviceName}`);
    if (currentCost > 1000 && await this.detectAnomaly(serviceName, currentCost)) {
      return `Investigate usage spikes and consider rightsizing for ${serviceName}. Potential cost savings identified.`;
    }
    if (serviceName.includes("EC2") && currentCost > 500) {
      return `Review ${serviceName} instance types and consider Reserved Instances or Savings Plans for long-term commitment.`;
    }
    if (serviceName.includes("S3") && currentCost > 200) {
        return `Analyze ${serviceName} access patterns for potential lifecycle rule implementation or intelligent tiering.`;
    }
    return "Current usage appears aligned with expectations. Continued monitoring advised.";
  },

  /**
   * Recommends S3 tiering based on access patterns, data age, and classification.
   * This would involve analyzing CloudWatch/S3 Access Logs, object tags, and content analysis.
   * Like a librarian categorizing books for ease of access and preservation.
   * @param objectKey S3 object key.
   * @param metadata S3 object metadata.
   * @returns Recommended storage class.
   */
  async recommendS3Tiering(objectKey: string, metadata: Record<string, string>): Promise<'STANDARD' | 'IA' | 'GLACIER' | 'DEEP_ARCHIVE'> {
    logger.debug(`AI S3 Tiering: Recommending tier for ${objectKey}`);
    const lastAccessedDays = parseInt(metadata['last-accessed-days'] || '0');
    const classification = metadata['data-classification'] || 'general'; // From a prior AI classification step

    if (classification.includes('CRITICAL') || lastAccessedDays < 30) {
      return 'STANDARD'; // High access or critical data remains readily available
    }
    if (lastAccessedDays >= 30 && lastAccessedDays < 90) {
      return 'IA'; // Infrequent Access for data not touched recently but may be needed quickly
    }
    if (lastAccessedDays >= 90 && lastAccessedDays < 365) {
      return 'GLACIER'; // Archival for longer-term retention, accessible within hours
    }
    if (lastAccessedDays >= 365) {
      return 'DEEP_ARCHIVE'; // Deep archival for rarely accessed, long-term historical data
    }
    return 'STANDARD'; // Default if no clear pattern emerges
  },

  /**
   * Analyzes S3 security posture for potential risks.
   * This would involve checking bucket policies, ACLs, encryption status, and public access blocks.
   * Like a sentinel scanning for vulnerabilities in a fortress.
   * @param bucketName S3 bucket name.
   * @param tags S3 bucket tags.
   * @returns Array of security alerts.
   */
  async analyzeS3Security(bucketName: string, tags: Record<string, string>): Promise<string[]> {
    logger.debug(`AI S3 Security: Analyzing security for bucket ${bucketName}`);
    const alerts: string[] = [];
    // Simulated checks:
    const isPublic = tags['public-access'] === 'true' || bucketName.includes('public'); // Heuristic
    if (isPublic) {
      alerts.push('Public access detected on bucket - review for sensitive data exposure risks.');
    }
    const encryptionStatus = tags['encryption-status'] || 'unknown';
    if (encryptionStatus !== 'SSE-S3' && encryptionStatus !== 'SSE-KMS') { // Assuming server-side encryption is desired
      alerts.push('Server-Side Encryption (SSE) is not enabled or unknown. Data at rest may be vulnerable.');
    }
    if (!tags['access-logging-enabled'] || tags['access-logging-enabled'] !== 'true') {
        alerts.push('Access logging is not enabled. Critical for auditing and security forensics.');
    }
    return alerts;
  },

  /**
   * Assesses the compliance posture of an S3 bucket based on defined policies and data classification.
   * Like a compliance officer reviewing adherence to sacred vows.
   * @param bucketName S3 bucket name.
   * @param tags S3 bucket tags.
   * @returns A numerical compliance score (e.g., 0-100) or a status string.
   */
  async assessS3Compliance(bucketName: string, tags: Record<string, string>): Promise<number> {
    logger.debug(`AI S3 Compliance: Assessing compliance for bucket ${bucketName}`);
    let score = 100; // Start with full compliance

    // Deduct points for missing or problematic configurations
    if (!tags['owner'] || !tags['department']) {
      score -= 10; alerts.push("Missing ownership/department tags (governance gap).");
    }
    if (await this.analyzeS3Security(bucketName, tags).then(a => a.length > 0)) { // Integrate security alerts
      score -= 20; alerts.push("Security vulnerabilities detected, impacting compliance.");
    }
    if (tags['data-classification'] === 'PII' && tags['retention-policy'] !== 'GDPR-7Y') {
      score -= 30; alerts.push("PII data detected without appropriate GDPR retention policy.");
    }

    return Math.max(0, score); // Ensure score is not negative
  },

  /**
   * Provides proactive health suggestions for EC2 instances based on metrics.
   * Like a mechanic listening to the hum of an engine for early signs of trouble.
   * @param instanceId EC2 instance ID.
   * @param metrics Current metrics for the instance.
   * @returns A string suggesting a proactive action or stating good health.
   */
  async suggestEc2HealthAction(instanceId: string, metrics: any): Promise<string> {
    logger.debug(`AI EC2 Health: Suggesting action for ${instanceId}`);
    if (metrics.cpuUtilization > 90 && metrics.networkIn > 1000000) { // High CPU and Network traffic
      return `High CPU and network I/O detected for ${instanceId}. Consider scaling up or horizontal scaling.`;
    }
    if (metrics.cpuUtilization < 10 && metrics.networkIn < 100000) { // Very low CPU and Network traffic
      return `Low utilization detected for ${instanceId}. Consider rightsizing or scheduling for cost optimization.`;
    }
    if (metrics.diskOps > 5000) { // High disk operations
      return `Elevated disk I/O for ${instanceId}. Review application I/O patterns or consider a disk with higher IOPS capacity.`;
    }
    return `EC2 instance ${instanceId} appears to be operating within optimal parameters.`;
  }
};

// src/ai/identity_security_advisor.ts
import { logger } from '../utils/logger';
// import { datetime } from 'src/utils/datetime'; // Custom datetime utility for consistent date handling
// For this example, we'll assume `datetime` is a standard Date object in TypeScript context or equivalent in Python.

export interface IIdentitySecurityAdvisor {
  analyzeLoginPattern(userId: string, loginTime: Date, loginLocation: string): Promise<boolean>;
  logUserAction(userId: string, actionType: string, status: string, details?: Record<string, any>): Promise<void>;
  assessUserRisk(userId: string, userData: any): Promise<number>;
  identifyStaleAccounts(): Promise<string[]>;
}

export const IdentitySecurityAdvisor: IIdentitySecurityAdvisor = {
  // Store user login patterns (simplified in-memory store for concept demonstration)
  // In a real system, this would persist in a database or event stream for ML training.
  _userLoginHistory: new Map<string, Array<{ timestamp: Date; location: string }>>(),

  /**
   * Simulates an AI model analyzing user login patterns for anomalies.
   * This would typically leverage time-series analysis, geo-location proximity, and behavioral biometrics.
   * Like a seasoned watchman recognizing a familiar gait, or detecting an unfamiliar shadow.
   * @param userId The ID of the user.
   * @param loginTime The time of the login event.
   * @param loginLocation The location of the login (e.g., IP address, geo-location).
   * @returns True if an anomalous login pattern is detected, false otherwise.
   */
  async analyzeLoginPattern(userId: string, loginTime: Date, loginLocation: string = 'unknown'): Promise<boolean> {
    logger.debug(`AI Identity Security: Analyzing login for user ${userId} at ${loginLocation}`);
    const history = IdentitySecurityAdvisor._userLoginHistory.get(userId) || [];
    IdentitySecurityAdvisor._userLoginHistory.set(userId, [...history.slice(-20), { timestamp: loginTime, location: loginLocation }]); // Keep last 20 logins

    if (history.length < 5) {
      return false; // Not enough historical data to reliably detect patterns
    }

    // Heuristic 1: If login location is outside typical patterns for the user
    const knownLocations = new Set(history.map(entry => entry.location).filter(loc => loc !== 'unknown'));
    const newLocationThreshold = knownLocations.size > 0 && !knownLocations.has(loginLocation);

    // Heuristic 2: Login time outside of usual active hours for the user (e.g., 3 AM if usually logs in during business hours)
    const activeHours = history.map(entry => entry.timestamp.getHours());
    const averageHour = activeHours.reduce((sum, h) => sum + h, 0) / activeHours.length;
    const stdDevHour = Math.sqrt(activeHours.map(h => Math.pow(h - averageHour, 2)).reduce((a, b) => a + b) / activeHours.length);
    const unusualLoginTime = Math.abs(loginTime.getHours() - averageHour) > (stdDevHour * 2 + 4); // 2 standard deviations plus a buffer

    if (newLocationThreshold) {
      logger.warn(`Anomaly detected for user ${userId}: Login from new or unusual location: ${loginLocation}`);
      return true;
    }
    if (unusualLoginTime) {
        logger.warn(`Anomaly detected for user ${userId}: Unusual login time: ${loginTime.toUTCString()}`);
        return true;
    }

    return false;
  },

  /**
   * Logs a user action for AI model training and real-time analysis.
   * This data is crucial for learning behavioral baselines and identifying deviations.
   * Like recording every significant event in a journal for future reflection.
   * @param userId The ID of the user.
   * @param actionType The type of action (e.g., 'block', 'create', 'assign_roles', 'access_sensitive_data').
   * @param status The outcome of the action ('successful', 'failed').
   * @param details Additional action details.
   */
  async logUserAction(userId: string, actionType: string, status: string, details: Record<string, any> = {}): Promise<void> {
    logger.info(`AI Identity Security: Logging user action: ${userId} - ${actionType} (${status})`, { userId, actionType, status, details, timestamp: new Date().toISOString() });
    // In a real scenario, this would send data to a queue for ML pipeline ingestion and real-time behavioral analysis.
  },

  /**
   * Assesses a comprehensive risk score for a user based on various factors.
   * This could include login patterns, recent actions, assigned roles, and external threat intelligence.
   * Like a seasoned judge weighing all available evidence.
   * @param userId The ID of the user.
   * @param userData Comprehensive user data.
   * @returns A numerical risk score (e.g., 0-100, higher is riskier).
   */
  async assessUserRisk(userId: string, userData: any): Promise<number> {
    logger.debug(`AI Identity Security: Assessing risk for user ${userId}`);
    let riskScore = 0;

    // Simulate risk factors
    if (await IdentitySecurityAdvisor.analyzeLoginPattern(userId, new Date(), userData.last_ip || 'unknown')) {
      riskScore += 30; // High risk for anomalous login
    }
    if (userData.roles && userData.roles.includes('admin') || userData.roles.includes('global-reader')) {
      riskScore += 15; // Elevated privilege means higher impact risk
    }
    if (!userData.mfa_enabled) { // Assuming this field exists or can be derived
      riskScore += 10; // Lack of MFA increases vulnerability
    }
    // Integrate with hypothetical external threat intelligence (e.g., IP reputation)
    const externalThreatFactor = Math.random() < 0.05 ? 20 : 0; // 5% chance of external threat
    riskScore += externalThreatFactor;

    return Math.min(100, riskScore); // Cap at 100
  },

  /**
   * Identifies potentially stale or inactive user accounts.
   * Like a gardener pruning old branches to ensure the health of the tree.
   * @returns An array of user IDs of identified stale accounts.
   */
  async identifyStaleAccounts(): Promise<string[]> {
    logger.debug(`AI Identity Security: Identifying stale accounts`);
    const staleAccounts: string[] = [];
    const inactiveThresholdDays = 90; // Accounts inactive for 90 days are considered stale for review

    // This would typically involve querying the IdP for `lastLogin` or `lastActivity`
    // For this conceptual example, we'll simulate based on internal history (not truly comprehensive)
    const currentTime = new Date();
    for (const [userId, history] of IdentitySecurityAdvisor._userLoginHistory.entries()) {
      if (history.length === 0) { // No login history recorded by this advisor
        // In real system, would query IdP
        continue;
      }
      const lastLoginTime = history[history.length - 1].timestamp;
      const daysSinceLastLogin = (currentTime.getTime() - lastLoginTime.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceLastLogin > inactiveThresholdDays) {
        staleAccounts.push(userId);
        logger.info(`Stale account identified: ${userId} (last login ${daysSinceLastLogin} days ago).`);
      }
    }
    return staleAccounts;
  }
};

// src/ai/data_intelligence_engine.ts
import { logger } from '../utils/logger';

export const aiDataIntelligence = {
  /**
   * Classifies data based on its content, metadata, and perceived sensitivity.
   * This would involve natural language processing, pattern matching, and tag analysis.
   * Like a scholar discerning the true subject and importance of a text.
   * @param objectKey The key/path of the data object.
   * @param metadata The metadata associated with the object.
   * @param contentSample Optional: a sample of the content for deeper analysis.
   * @returns A classification string (e.g., 'PII', 'CONFIDENTIAL', 'PUBLIC', 'REGULATORY_COMPLIANT').
   */
  async classifyData(objectKey: string, metadata: Record<string, any>, contentSample?: string): Promise<string> {
    logger.debug(`AI Data Intelligence: Classifying data for ${objectKey}`);
    let classification = 'UNCLASSIFIED';

    // Heuristic 1: Based on object name/path
    if (objectKey.includes('invoice') || objectKey.includes('customer-data') || objectKey.includes('financial-report')) {
      classification = 'FINANCIAL_SENSITIVE';
    } else if (objectKey.includes('public-') || objectKey.endsWith('.js') || objectKey.endsWith('.css') || objectKey.includes('web-assets')) {
      classification = 'PUBLIC';
    } else if (objectKey.includes('backup') || objectKey.includes('archive')) {
      classification = 'ARCHIVAL';
    }

    // Heuristic 2: Based on metadata tags (explicit declarations)
    if (metadata.sensitivity && metadata.sensitivity.toLowerCase() === 'high') {
      classification = 'HIGH_SENSITIVITY';
    }
    if (metadata.contains_pii === 'true') {
      classification = 'PII_DETECTED';
    }
    if (metadata.compliance_mandate) {
        classification += `_${metadata.compliance_mandate.toUpperCase()}`;
    }

    // Heuristic 3: Content-based analysis (simulated NLP/regex for patterns)
    if (contentSample) {
      if (contentSample.toLowerCase().includes('social security number') || contentSample.match(/\b\d{3}-\d{2}-\d{4}\b/) || contentSample.toLowerCase().includes('credit card')) {
        classification = 'PII_DETECTED_DEEP_SCAN';
      }
      if (contentSample.toLowerCase().includes('confidential agreement') || contentSample.toLowerCase().includes('trade secret')) {
        classification = 'HIGH_SENSITIVITY_CONTENT_CONFIRMED';
      }
    }

    // Prioritize classifications
    if (classification.includes('PII')) return 'PII_DETECTED';
    if (classification.includes('HIGH_SENSITIVITY')) return 'HIGH_SENSITIVITY';
    if (classification.includes('FINANCIAL_SENSITIVE')) return 'FINANCIAL_SENSITIVE';
    if (classification.includes('PUBLIC')) return 'PUBLIC';
    if (classification.includes('ARCHIVAL')) return 'ARCHIVAL';

    return classification;
  },

  /**
   * Recommends optimal storage tiering based on access patterns, age, and classification.
   * This would analyze actual access logs, object size, and historical data usage.
   * Like an experienced archivist recommending the ideal preservation method for each artifact.
   * @param objectKey The key/path of the data object.
   * @param metadata The metadata associated with the object.
   * @param currentStorageClass The current storage class (if known).
   * @returns Recommended storage class (e.g., 'STANDARD', 'NEARLINE', 'COLDLINE', 'ARCHIVE').
   */
  async recommendTiering(objectKey: string, metadata: Record<string, any>, currentStorageClass?: string): Promise<'STANDARD' | 'NEARLINE' | 'COLDLINE' | 'ARCHIVE'> {
    logger.debug(`AI Data Intelligence: Recommending tiering for ${objectKey}`);
    const classification = await this.classifyData(objectKey, metadata);
    const lastAccessed = metadata.lastAccessed ? new Date(metadata.lastAccessed) : new Date(0); // Assuming 'lastAccessed'
    const ageInDays = (new Date().getTime() - lastAccessed.getTime()) / (1000 * 60 * 60 * 24);
    const sizeInBytes = parseInt(metadata.size || '0'); // Assume size from metadata

    // High sensitivity data, regardless of access patterns, might default to STANDARD for quick recovery/auditing
    if (classification.includes('PII') || classification.includes('HIGH_SENSITIVITY')) {
      return 'STANDARD';
    }

    // Logic based on age, access patterns (simulated), and size
    if (ageInDays < 30 || metadata.accessFrequency === 'high') { // Frequently accessed, less than 30 days old
      return 'STANDARD';
    }
    if (ageInDays >= 30 && ageInDays < 90 && sizeInBytes > 1024 * 1024 * 5) { // Older than 30 days, larger than 5MB, infrequently accessed
      return 'NEARLINE';
    }
    if (ageInDays >= 90 && ageInDays < 365 && sizeInBytes > 1024 * 1024 * 50) { // Older than 90 days, larger than 50MB, rarely accessed
      return 'COLDLINE';
    }
    if (ageInDays >= 365) { // Older than 1 year, suitable for deep archival
      return 'ARCHIVE';
    }
    return currentStorageClass as 'STANDARD' | 'NEARLINE' | 'COLDLINE' | 'ARCHIVE' || 'STANDARD'; // Fallback to current or standard
  },

  /**
   * Scans data objects for potential security risks (e.g., public exposure, unencrypted data).
   * This would typically integrate with cloud security posture management (CSPM) tools or data loss prevention (DLP) engines.
   * Like a vigilant guardian inspecting the integrity of the library's defenses.
   * @param objectKey The key/path of the data object.
   * @param metadata The metadata associated with the object.
   * @returns An array of detected security alerts.
   */
  async scanForSecurityRisks(objectKey: string, metadata: Record<string, any>): Promise<string[]> {
    logger.debug(`AI Data Intelligence: Scanning security for ${objectKey}`);
    const alerts: string[] = [];
    if (metadata.public_access === 'true' || objectKey.toLowerCase().includes('public/')) {
      alerts.push('Publicly accessible data detected. Review access controls carefully.');
    }
    if (metadata.encryption_status === 'unencrypted' || !metadata.encryption_status && !objectKey.includes('non-sensitive')) {
      alerts.push('Unencrypted data detected. Recommend encryption at rest.');
    }
    if (metadata.virus_scan_status === 'failed' || (metadata.virus_scan_required === 'true' && !metadata.virus_scan_status)) {
        alerts.push('Virus scan failed or required for this object. Potential malware risk.');
    }
    const classification = await this.classifyData(objectKey, metadata);
    if ((classification.includes('PII') || classification.includes('SENSITIVE')) && alerts.length > 0) {
        alerts.push('Highly sensitive data with detected security vulnerabilities. Immediate attention required.');
    }
    return alerts;
  },

  /**
   * Assesses the compliance status of a data object based on its classification and metadata.
   * This involves checking against configured compliance policies (e.g., GDPR, HIPAA).
   * Like a legal scholar ensuring every document adheres to the established laws.
   * @param objectKey The key/path of the data object.
   * @param metadata The metadata associated with the object.
   * @param classification The AI-driven data classification.
   * @returns A status string (e.g., 'COMPLIANT', 'NON_COMPLIANT', 'PENDING_REVIEW').
   */
  async assessCompliance(objectKey: string, metadata: Record<string, any>, classification: string): Promise<string> {
    logger.debug(`AI Data Intelligence: Assessing compliance for ${objectKey}`);
    const requiredCompliance = metadata.required_compliance_standard; // e.g., 'GDPR', 'HIPAA'
    const retentionPolicy = metadata.retention_policy; // e.g., '7_years'
    const isEncrypted = metadata.encryption_status === 'SSE-S3' || metadata.encryption_status === 'SSE-KMS';

    if (classification.includes('PII')) {
        if (requiredCompliance === 'GDPR') {
            if (retentionPolicy === 'GDPR-7Y' && isEncrypted) {
                return 'COMPLIANT_GDPR';
            } else {
                return 'NON_COMPLIANT_GDPR';
            }
        } else {
            return 'PENDING_REVIEW_PII'; // PII without explicit GDPR, needs review
        }
    }
    if (classification.includes('HIGH_SENSITIVITY')) {
        if (!isEncrypted) {
            return 'NON_COMPLIANT_ENCRYPTION';
        }
    }

    // Default to compliant if no specific compliance issues detected for its class
    return 'COMPLIANT';
  },

  /**
   * Logs a data action for AI model training and auditing.
   * This forms the behavioral dataset for learning optimal data governance.
   * Like a meticulous chronicler recording the journey of each piece of knowledge.
   * @param objectKey The key/path of the data object.
   * @param actionType The type of action (e.g., 'upload', 'download', 'delete', 'storage_class_change').
   * @param status The outcome of the action ('successful', 'failed').
   * @param details Additional action details.
   */
  async logDataAction(objectKey: string, actionType: string, status: string, details: Record<string, any> = {}): Promise<void> {
    logger.info(`AI Data Intelligence: Logging data action: ${objectKey} - ${actionType} (${status})`, { objectKey, actionType, status, details, timestamp: new Date().toISOString() });
    // This event would be streamed to a data lake for ML pipeline ingestion, enabling
    // continuous learning for access pattern prediction, anomaly detection, and compliance auditing.
  },
};

// src/ai/compute_optimizer.ts
import { logger } from '../utils/logger';

export interface ScalingRecommendation {
  action: 'SCALE_UP' | 'SCALE_DOWN' | 'MAINTAIN' | 'OPTIMIZE_COST';
  reason: string;
  recommendedSize?: string; // For VM resizing
  recommendedCount?: number; // For container scaling
}

export interface IComputeOptimizer {
  analyzeVmWorkload(vmId: string, metrics: any): ScalingRecommendation;
  scanVmSecurity(vmId: string, tags: Record<string, string | undefined> | undefined, powerState: string): string[];
  recommendVmPerformanceAction(vmId: string, metrics: any): string;
  logVmAction(vmId: string, actionType: string, status: string, provider: string, details?: Record<string, any>): void;
  recommendEcsScaling(service: any): Promise<'SCALE_UP' | 'SCALE_DOWN' | 'MAINTAIN' | 'OPTIMIZE_COST'>;
  detectEcsAnomalies(service: any): Promise<string[]>;
  recommendEcsPerformanceAction(service: any): Promise<string>;
  logEcsAction(serviceName: string, clusterName: string, actionType: string, status: string, details?: Record<string, any>): void;
  getOptimizedEcsCount(serviceName: string, clusterName: string): Promise<number>;
}

export const aiComputeOptimizer: IComputeOptimizer = {
  // Simple in-memory history for conceptual metrics, in reality, use a time-series database.
  _vmMetricsHistory: new Map<string, Array<any>>(),
  _ecsServiceMetricsHistory: new Map<string, Array<any>>(),

  /**
   * Analyzes VM workload metrics to provide scaling recommendations.
   * This would involve predictive analytics on CPU, memory, network, and disk I/O.
   * Like a master chess player foreseeing several moves ahead to ensure optimal board position.
   * @param vmId The ID of the VM.
   * @param metrics Current VM metrics.
   * @returns ScalingRecommendation.
   */
  analyzeVmWorkload(vmId: string, metrics: any): ScalingRecommendation {
    logger.debug(`AI Compute Optimizer: Analyzing VM workload for ${vmId}`);
    const history = aiComputeOptimizer._vmMetricsHistory.get(vmId) || [];
    aiComputeOptimizer._vmMetricsHistory.set(vmId, [...history.slice(-30), metrics]); // Keep last 30 data points

    if (history.length < 10) { // Not enough data for reliable analysis
      return { action: 'MAINTAIN', reason: 'Insufficient historical data for a precise recommendation.' };
    }

    const avgCpu = history.reduce((sum, m) => sum + (m.cpuUtilization || 0), 0) / history.length;
    const avgMem = history.reduce((sum, m) => sum + (m.memoryUsage || 0), 0) / history.length;

    // Scaling heuristics based on utilization and recent trends
    if (metrics.cpuUtilization > 85 && avgCpu > 70) {
      return { action: 'SCALE_UP', reason: 'Sustained high CPU utilization. Increased workload detected.' };
    }
    if (metrics.cpuUtilization < 15 && avgCpu < 20 && metrics.networkIn === 0 && metrics.diskOps === 0) {
      return { action: 'SCALE_DOWN', reason: 'Consistently low utilization. Resource might be over-provisioned or idle.' };
    }
    if (metrics.memoryUsage > 90 && avgMem > 80) { // Assuming memoryUsage is a percentage
        return { action: 'SCALE_UP', reason: 'Sustained high memory usage. Consider larger instance or memory optimization.' };
    }
    if (metrics.cpuUtilization > 50 && avgCpu > 40 && metrics.networkIn > 5000000 && history.slice(-5).every(m => m.cpuUtilization > 60)) {
        return { action: 'OPTIMIZE_COST', reason: 'Moderate-to-high sustained usage. Evaluate for Reserved Instances or rightsizing opportunities.' };
    }

    return { action: 'MAINTAIN', reason: 'Workload within expected parameters.' };
  },

  /**
   * Scans VM for potential security misconfigurations or vulnerabilities.
   * This would integrate with cloud security services and configuration management.
   * Like a castle guard inspecting the walls for any weak points.
   * @param vmId The ID of the VM.
   * @param tags Current tags associated with the VM.
   * @param powerState Current power state of the VM.
   * @returns An array of detected security alerts.
   */
  scanVmSecurity(vmId: string, tags: Record<string, string | undefined> | undefined, powerState: string): string[] {
    logger.debug(`AI Compute Optimizer: Scanning VM security for ${vmId}`);
    const alerts: string[] = [];

    // Simulate checks
    const hasPublicIP = tags && (tags['public-ip'] === 'true' || tags['network-interface-public'] === 'true'); // Heuristic
    if (hasPublicIP && powerState === 'Running' && (!tags || tags['security-group-hardened'] !== 'true')) {
      alerts.push('VM has public IP without explicit security group hardening. Potential exposure.');
    }
    if (powerState === 'Stopped' && tags && tags['auto-shutdown-enabled'] !== 'true' && tags['environment'] !== 'prod') {
      alerts.push('Stopped VM is not tagged for auto-shutdown. Potential cost leakage.');
    }
    if (!tags || tags['patch-management-enabled'] !== 'true') {
        alerts.push('Patch management system not indicated. Review for OS/software vulnerabilities.');
    }
    return alerts;
  },

  /**
   * Recommends specific performance actions for a VM based on observed metrics.
   * This goes beyond scaling to suggest configuration changes, software updates, etc.
   * Like a maestro suggesting a subtle change in tempo or dynamics for a more impactful performance.
   * @param vmId The ID of the VM.
   * @param metrics Current VM metrics.
   * @returns A string detailing the recommended performance action.
   */
  recommendVmPerformanceAction(vmId: string, metrics: any): string {
    logger.debug(`AI Compute Optimizer: Recommending performance action for ${vmId}`);
    if (metrics.diskIOPs > 5000 && metrics.cpuUtilization < 60) {
      return `High disk I/O, but moderate CPU for ${vmId}. Consider upgrading disk type (e.g., SSD premium) or optimizing application storage access patterns.`;
    }
    if (metrics.networkOut > 100000000 && metrics.cpuUtilization < 30) { // 100MB/s network out, low CPU
        return `High network egress with low CPU on ${vmId}. Examine network intensive applications or consider optimizing data transfer costs (e.g., CDN).`;
    }
    return `VM ${vmId} performance appears stable.`;
  },

  /**
   * Logs a VM action for AI model training and auditing.
   * This creates the dataset for learning optimal compute management strategies.
   * Like a meticulous chronicler recording every adjustment made to the orchestra's setup.
   * @param vmId The ID of the VM.
   * @param actionType The type of action (e.g., 'start', 'stop', 'resize').
   * @param status The outcome of the action ('successful', 'failed').
   * @param provider The cloud provider ('AWS', 'Azure').
   * @param details Additional action details.
   */
  logVmAction(vmId: string, actionType: string, status: string, provider: string, details: Record<string, any> = {}): void {
    logger.info(`AI Compute Optimizer: Logging VM action: ${vmId} - ${actionType} (${status}) from ${provider}`, { vmId, actionType, status, provider, details, timestamp: new Date().toISOString() });
    // This event would be streamed to a data lake for ML pipeline ingestion
  },

  /**
   * Recommends scaling for an ECS service based on its current state and historical metrics.
   * Like a stage manager adjusting the number of performers based on audience size and script requirements.
   * @param service ECS service object.
   * @returns A scaling recommendation.
   */
  async recommendEcsScaling(service: any): Promise<'SCALE_UP' | 'SCALE_DOWN' | 'MAINTAIN' | 'OPTIMIZE_COST'> {
    logger.debug(`AI Compute Optimizer: Recommending ECS scaling for service ${service.serviceName}`);
    const serviceKey = `${service.clusterArn}:${service.serviceArn}`;
    const history = aiComputeOptimizer._ecsServiceMetricsHistory.get(serviceKey) || [];
    aiComputeOptimizer._ecsServiceMetricsHistory.set(serviceKey, [...history.slice(-60), service]); // Keep last 60 service states

    if (history.length < 10) {
      return 'MAINTAIN'; // Insufficient data
    }

    const avgCpuUtilization = history.reduce((sum, s) => sum + (s.cpuUtilization || 0), 0) / history.length;
    const avgMemoryUtilization = history.reduce((sum, s) => sum + (s.memoryUtilization || 0), 0) / history.length;
    const currentRunning = service.runningCount;
    const currentDesired = service.desiredCount;

    if (avgCpuUtilization > 80 || avgMemoryUtilization > 80) {
      return 'SCALE_UP'; // High utilization, indicating need for more tasks
    }
    if (avgCpuUtilization < 20 && avgMemoryUtilization < 20 && currentRunning > 1) {
      return 'SCALE_DOWN'; // Low utilization, tasks can be reduced
    }
    if (currentRunning < currentDesired * 0.8 && history.slice(-5).every(s => s.pendingCount > 0)) {
        return 'SCALE_UP'; // Pending tasks indicate insufficient capacity
    }
    if (avgCpuUtilization < 30 && avgMemoryUtilization < 30 && currentRunning > 0) {
        return 'OPTIMIZE_COST'; // Opportunity to reduce tasks and save costs
    }

    return 'MAINTAIN';
  },

  /**
   * Detects anomalies in ECS service behavior or performance.
   * Like a keen observer noticing an unusual rhythm or a discordant note in the performance.
   * @param service ECS service object.
   * @returns An array of detected anomaly alerts.
   */
  async detectEcsAnomalies(service: any): Promise<string[]> {
    logger.debug(`AI Compute Optimizer: Detecting ECS anomalies for service ${service.serviceName}`);
    const alerts: string[] = [];

    // Simulate checks:
    if (service.runningCount < service.desiredCount && service.pendingCount === 0 && service.status !== 'INACTIVE') {
      alerts.push('Service running count is below desired count with no pending tasks. Investigate deployment or resource issues.');
    }
    if (service.events && service.events.some((event: any) => event.message.includes('DRAINING') || event.message.includes('STOPPED') && !event.message.includes('User initiated'))) {
      alerts.push('Unscheduled task stop or draining event detected. Potential instability.');
    }
    if (service.status === 'ACTIVE' && service.desiredCount === 0) {
        alerts.push('Active service with desired task count of zero. Verify intended state or potential misconfiguration.');
    }
    return alerts;
  },

  /**
   * Recommends performance-specific actions for an ECS service (e.g., container sizing, task placement).
   * Like fine-tuning the acoustics of the concert hall or adjusting instruments for clarity.
   * @param service ECS service object.
   * @returns A string detailing the performance recommendation.
   */
  async recommendEcsPerformanceAction(service: any): Promise<string> {
    logger.debug(`AI Compute Optimizer: Recommending ECS performance for service ${service.serviceName}`);
    // This would require analyzing container-level metrics, log data, and task definition properties.
    // Placeholder based on service-level view:
    const serviceKey = `${service.clusterArn}:${service.serviceArn}`;
    const history = aiComputeOptimizer._ecsServiceMetricsHistory.get(serviceKey) || [];

    if (history.length > 20) {
      const recentCpuUtilizations = history.slice(-10).map((s: any) => s.cpuUtilization || 0);
      const averageRecentCpu = recentCpuUtilizations.reduce((a: number, b: number) => a + b, 0) / recentCpuUtilizations.length;

      if (averageRecentCpu > 95) {
        return `Sustained high CPU utilization for ${service.serviceName}. Review task definition CPU limits/reservations or consider a larger instance type for EC2 launch type.`;
      }
      if (averageRecentCpu < 10 && service.runningCount > 0) {
        return `Consistently low CPU utilization for ${service.serviceName}. Optimize container CPU/memory requests or scale down.`;
      }
    }
    return `ECS service ${service.serviceName} performance appears optimal.`;
  },

  /**
   * Logs an ECS action for AI model training and auditing.
   * This builds the intelligence for self-optimizing container orchestration.
   * Like the conductor's meticulous notes on each rehearsal and performance.
   * @param serviceName The name of the ECS service.
   * @param clusterName The name of the ECS cluster.
   * @param actionType The type of action (e.g., 'update_desired_count', 'register_task_definition').
   * @param status The outcome of the action ('successful', 'failed').
   * @param details Additional action details.
   */
  logEcsAction(serviceName: string, clusterName: string, actionType: string, status: string, details: Record<string, any> = {}): void {
    logger.info(`AI Compute Optimizer: Logging ECS action: ${serviceName} in ${clusterName} - ${actionType} (${status})`, { serviceName, clusterName, actionType, status, details, timestamp: new Date().toISOString() });
    // This event data is critical for retraining models that predict optimal scaling and resource allocation.
  },

  /**
   * Provides an AI-driven optimized task count for an ECS service.
   * This would typically be based on predictive models that learn peak and off-peak demands.
   * Like a master logistician determining the precise number of resources needed for a smooth operation.
   * @param serviceName The name of the ECS service.
   * @param clusterName The name of the ECS cluster.
   * @returns The recommended optimized desired task count.
   */
  async getOptimizedEcsCount(serviceName: string, clusterName: string): Promise<number> {
    logger.debug(`AI Compute Optimizer: Getting optimized ECS count for service ${serviceName}`);
    // Simulate complex model logic
    const baseOptimal = 2; // Default baseline
    const historicalPeakFactor = Math.random() * 2; // Simulates historical peaks influence
    const predictedFutureLoad = 1 + (Math.sin(new Date().getHours() / 24 * Math.PI * 2) + 1) / 2; // Daily load pattern simulation (1.0 to 2.0)

    const optimizedCount = Math.ceil(baseOptimal * historicalPeakFactor * predictedFutureLoad);
    return Math.max(1, optimizedCount); // Ensure at least one task
  }
};
```