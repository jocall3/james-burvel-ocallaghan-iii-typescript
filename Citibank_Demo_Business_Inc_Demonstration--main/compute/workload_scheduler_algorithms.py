import dataclasses
import enum
import random
import time
from typing import List, Dict, Any, Optional

# --- Enums and Constants ---

class WorkloadPriority(enum.IntEnum):
    """Defines the priority levels for workloads, with higher integer values indicating higher priority."""
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4

class WorkloadStatus(enum.Enum):
    """Defines the lifecycle status of a workload, from initial submission to completion or failure."""
    PENDING = "PENDING"
    SCHEDULED = "SCHEDULED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    PREEMPTED = "PREEMPTED"

# --- Data Models ---

@dataclasses.dataclass
class Workload:
    """
    Represents a computational workload to be scheduled by the Engine Core.
    Each workload embodies a specific task within the platform's distributed computational fabric,
    from batch processing and analytics to real-time service requests.
    """
    id: str
    cpu_required: float
    memory_required_gb: float
    priority: WorkloadPriority
    deadline_timestamp: Optional[float] = None  # Unix timestamp by which the workload ideally completes
    data_locality_tags: List[str] = dataclasses.field(default_factory=list) # Tags for data proximity preferences
    cost_sensitivity: float = 0.5  # A float from 0.0 (not sensitive) to 1.0 (highly sensitive to cost reductions)
    status: WorkloadStatus = WorkloadStatus.PENDING
    assigned_resource_id: Optional[str] = None
    start_time: Optional[float] = None
    expected_duration_seconds: float = 3600  # Default to 1 hour for planning and optimization

@dataclasses.dataclass
class ComputeResource:
    """
    Represents an available compute resource within the multi-cloud, hybrid environment.
    These resources are continuously monitored and dynamically managed by the Engine Core
    to ensure optimal performance and cost efficiency.
    """
    id: str
    total_cpu: float
    total_memory_gb: float
    location_tags: List[str] = dataclasses.field(default_factory=list) # Geographic or logical location tags (e.g., 'us-east-1', 'on-prem-datacenter-a')
    cost_per_cpu_hour: float = 0.05  # Example cost for 1 CPU unit per hour
    cost_per_memory_gb_hour: float = 0.01  # Example cost for 1 GB memory per hour
    is_spot_instance: bool = False  # True if this is a preemptible instance (cheaper, but can be reclaimed by provider)
    
    available_cpu: float = dataclasses.field(init=False)
    available_memory_gb: float = dataclasses.field(init=False)
    current_workloads: List[str] = dataclasses.field(default_factory=list) # IDs of workloads currently running on this resource
    last_heartbeat: float = dataclasses.field(default_factory=time.time) # Timestamp of the last health/metric update
    load_factor: float = 0.0  # Current utilization load (0.0-1.0), reflecting overall busyness

    def __post_init__(self):
        """Initializes available resources to their total capacity upon creation."""
        self.available_cpu = self.total_cpu
        self.available_memory_gb = self.total_memory_gb

    def allocate(self, workload: Workload) -> None:
        """
        Allocates the specified workload's resources (CPU and memory) to this compute resource.
        Updates the resource's available capacity and recalculates its load factor.
        Raises ValueError if insufficient capacity exists for the requested workload.
        """
        if self.available_cpu < workload.cpu_required or \
           self.available_memory_gb < workload.memory_required_gb:
            raise ValueError(f"Resource '{self.id}' lacks sufficient capacity (CPU: {workload.cpu_required}, Mem: {workload.memory_required_gb}GB) for workload '{workload.id}'.")
        
        self.available_cpu -= workload.cpu_required
        self.available_memory_gb -= workload.memory_required_gb
        self.current_workloads.append(workload.id)
        self._update_load_factor()

    def deallocate(self, workload: Workload) -> None:
        """
        Deallocates the specified workload's resources from this compute resource.
        Restores available capacity and recalculates the load factor.
        Raises ValueError if the workload is not currently allocated to this resource.
        """
        if workload.id in self.current_workloads:
            self.available_cpu += workload.cpu_required
            self.available_memory_gb += workload.memory_required_gb
            self.current_workloads.remove(workload.id)
            self._update_load_factor()
        else:
            raise ValueError(f"Workload '{workload.id}' not found on resource '{self.id}' for deallocation.")

    def _update_load_factor(self) -> None:
        """
        Recalculates and updates the resource's `load_factor` based on its current CPU and
        memory utilization. This provides a real-time indicator of resource busyness.
        """
        cpu_util = (self.total_cpu - self.available_cpu) / self.total_cpu if self.total_cpu > 0 else 0
        mem_util = (self.total_memory_gb - self.available_memory_gb) / self.total_memory_gb if self.total_memory_gb > 0 else 0
        self.load_factor = max(cpu_util, mem_util) # Simple max, could be a weighted average or more complex metric

# --- Simulated Gemini API Client ---

class MockGeminiAPIClient:
    """
    A simulated client for the Gemini API, designed to mimic the advanced cognitive capabilities
    required for complex combinatorial optimization, dynamic scheduling, and detailed explanatory
    reasoning within the Compute module. This client adheres to the structural expectations
    of a production-grade Gemini API integration, encapsulating prompt engineering and
    `responseSchema` validation.
    """
    def __init__(self, api_key: str = "mock-api-key"):
        """Initializes the mock Gemini API client with a dummy API key."""
        self._api_key = api_key
        print("MockGeminiAPIClient initialized. This client simulates advanced AI capabilities for workload scheduling decisions.")

    def _simulate_complex_logic(self, prompt: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simulates the core AI decision-making for workload scheduling and resource allocation.
        This method embodies the 'cognitive core' by applying a sophisticated heuristic
        that approximates Gemini's expected optimization capabilities, considering
        workload priorities, deadlines, data locality, cost-sensitivity, and resource characteristics.
        """
        print(f"  [MockGemini] Simulating complex logic for prompt: '{prompt[:90]}...'")
        
        # Logic to simulate different AI capabilities based on the prompt's intent
        if "optimize a global schedule" in prompt.lower():
            workloads_raw = input_data.get("workloads", [])
            resources_raw = input_data.get("resources", [])

            # Convert raw input dictionaries back into Workload and ComputeResource objects for logic processing
            workloads = [Workload(**w) if isinstance(w, dict) else w for w in workloads_raw]
            resources = [ComputeResource(**r) if isinstance(r, dict) else r for r in resources_raw]

            assignments = []
            unallocated_workloads = []
            
            # Prioritize workloads: CRITICAL > HIGH > MEDIUM > LOW, then by earliest deadline, then by expected duration
            sorted_workloads = sorted(
                workloads,
                key=lambda w: (w.priority.value, w.deadline_timestamp if w.deadline_timestamp else float('inf'), w.expected_duration_seconds),
                reverse=True # Higher priority value comes first, earlier deadlines come first
            )

            # Create a mutable copy of resources for this simulated scheduling run
            simulated_resources = {r.id: dataclasses.replace(r) for r in resources}
            
            for workload in sorted_workloads:
                # If a workload is already running and its assigned resource is still valid, maintain its assignment for stability
                if workload.status == WorkloadStatus.RUNNING and workload.assigned_resource_id:
                    if workload.assigned_resource_id in simulated_resources:
                        resource = simulated_resources[workload.assigned_resource_id]
                        # Ensure resource still has capacity (accounting for workloads already assigned to it in this loop)
                        if resource.available_cpu >= workload.cpu_required and resource.available_memory_gb >= workload.memory_required_gb:
                            assignments.append({
                                "workload_id": workload.id,
                                "resource_id": workload.assigned_resource_id,
                                "estimated_cost": 0.0, # Cost already accounted for, or negligible for re-evaluation
                                "reason": "Workload already running; assignment maintained for stability and continuity."
                            })
                            resource.allocate(workload) # Temporarily allocate in simulation to update available capacity
                        continue # Skip to the next workload if it's already running and stable

                best_resource: Optional[ComputeResource] = None
                best_metric_score = float('inf') # Lower score indicates a more optimal placement

                # Filter resources by immediate capacity requirements
                eligible_resources = [
                    res for res_id, res in simulated_resources.items()
                    if res.available_cpu >= workload.cpu_required and
                       res.available_memory_gb >= workload.memory_required_gb
                ]
                
                for resource in eligible_resources:
                    # Calculate a multi-factor placement score
                    current_cost = (resource.cost_per_cpu_hour * workload.cpu_required +
                                    resource.cost_per_memory_gb_hour * workload.memory_required_gb)
                    
                    # Adjust cost based on spot instance availability and workload's cost sensitivity
                    if resource.is_spot_instance:
                        # Higher cost sensitivity -> larger discount from spot instance price
                        current_cost *= (1 - workload.cost_sensitivity * 0.7) 
                    
                    # Penalty for non-matching data locality (0 if met, higher if not)
                    locality_penalty = 0
                    if workload.data_locality_tags and not any(tag in resource.location_tags for tag in workload.data_locality_tags):
                        locality_penalty = current_cost * 0.5 # Substantial penalty for data transfer/latency
                    
                    # Load balancing factor: prefer less loaded resources
                    load_penalty = resource.load_factor * current_cost * 0.2 # Scale load impact relative to cost
                    
                    # Combine all factors into a single metric score
                    metric_score = current_cost + locality_penalty + load_penalty
                    
                    if metric_score < best_metric_score:
                        best_metric_score = metric_score
                        best_resource = resource
                
                if best_resource:
                    assignments.append({
                        "workload_id": workload.id,
                        "resource_id": best_resource.id,
                        "estimated_cost": best_metric_score, # Using the calculated metric score as estimated cost for simulation
                        "reason": (f"Optimal fit considering priority {workload.priority.name}, "
                                   f"data locality ({'met' if any(tag in best_resource.location_tags for tag in workload.data_locality_tags) else 'not met'}), "
                                   f"cost efficiency ({'spot-optimized' if best_resource.is_spot_instance else 'standard'}), "
                                   f"and current resource load ({best_resource.load_factor:.2f}).")
                    })
                    # Update the simulated resource state by allocating the workload
                    best_resource.allocate(workload)
                else:
                    unallocated_workloads.append(workload.id)

            explanation = (
                f"The AI orchestrator successfully optimized the schedule for {len(workloads)} workloads "
                f"across {len(resources)} available compute resources. A total of {len(assignments)} workloads "
                "were meticulously allocated based on a sophisticated multi-criteria objective function. "
                "This optimization prioritizes critical deadlines, ensures stringent data locality requirements "
                "are met where possible, and drives dynamic cost-efficiency by strategically leveraging spot instances "
                "for appropriate tasks. The system intelligently balanced resource utilization across the fabric "
                "to proactively prevent bottlenecks and ensure sustained peak performance."
            )
            if unallocated_workloads:
                explanation += f" Note: {len(unallocated_workloads)} workloads ({', '.join(unallocated_workloads)}) " \
                               f"could not be allocated in this cycle due to immediate resource constraints, " \
                               f"or a lack of suitable matches after optimizing for higher-priority tasks. " \
                               f"These will be re-evaluated in subsequent scheduling iterations or when new capacity becomes available."
            
            return {
                "schedule": assignments,
                "unallocated_workloads": unallocated_workloads,
                "rationale": explanation,
                "optimized_resource_states": [dataclasses.asdict(r) for r in simulated_resources.values()]
            }

        elif "perform root cause analysis for preemption" in prompt.lower():
            preempted_workload_id = input_data.get("preempted_workload_id")
            new_critical_workload_id = input_data.get("new_critical_workload_id")
            return {
                "preemption_justification": f"Workload '{preempted_workload_id}' was judiciously preempted to "
                                            f"immediately accommodate the higher-priority, mission-critical workload "
                                            f"'{new_critical_workload_id}'. This paramount decision ensures that critical business "
                                            "operations maintain uninterrupted performance and meet their stringent SLAs, "
                                            "thereby optimizing the overall system's responsiveness for the most vital tasks. "
                                            "Such actions are taken only after exhaustive AI evaluation of alternatives.",
                "action_taken": "The preempted workload has been gracefully deallocated and automatically marked for "
                                "re-queuing or prioritized migration to an alternative resource with suitable available capacity. "
                                "Its re-scheduling will be managed based on its original priority and any applicable deadlines, "
                                "ensuring minimal long-term impact."
            }

        # Default fallback for any other complex logic prompts
        return {
            "status": "success",
            "message": f"AI processed '{prompt[:50]}...' with input keys: {list(input_data.keys())}",
            "result": "Simulated AI decision."
        }

    def generateContent(self, prompt: str, response_schema: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        """
        Simulates `generateContent` with a structured `responseSchema`, ensuring the AI's
        output adheres to predefined formats for reliable downstream processing and automation.
        This is crucial for production-grade architecture where AI outputs drive actions.
        """
        print(f"\n[MockGeminiAPIClient.generateContent] Calling with prompt: '{prompt[:100]}...'")
        input_data = kwargs.get("input_data", {}) # Capture complex inputs for the AI's logic
        
        time.sleep(0.1) # Simulate network latency and processing time for a complex API call

        result = self._simulate_complex_logic(prompt, input_data)
        
        # In a real system, robust validation of `result` against `response_schema` would occur here.
        # For this mock, we assume the simulated logic produces a compatible structured output.
        print(f"  [MockGemini] Response generated and conceptually validated against schema.")
        return result

    def generateContentStream(self, prompt: str, **kwargs) -> List[Dict[str, Any]]:
        """
        Simulates `generateContentStream` for providing real-time insights or
        partial responses during an ongoing AI-driven optimization process. This mimics
        the continuous flow of intelligence from the AI.
        """
        print(f"\n[MockGeminiAPIClient.generateContentStream] Calling with prompt: '{prompt[:100]}...'")
        
        stream_results = []
        messages = [
            "Initiating real-time resource analysis across the entire hybrid-cloud footprint...",
            "Detecting dynamic shifts in workload demand; identifying nascent bottlenecks in US-East-1 region...",
            "Pinpointing underutilized capacity in EU-West-2, especially within spot instance pools...",
            "Re-evaluating cost-performance trade-offs for critical database clusters and analytics pipelines...",
            "Preparing a refined set of optimized allocation recommendations based on current load, predictive analytics, and evolving market conditions...",
            "Stream complete: Comprehensive adaptation insights provided for review."
        ]
        for i, msg in enumerate(messages):
            time.sleep(0.05) # Simulate streaming delay for each chunk
            stream_results.append({"chunk": i, "content": msg})
            print(f"  [MockGemini Stream] {msg}")
        
        return stream_results

# --- WorkloadScheduler Class ---

class WorkloadScheduler:
    """
    The Engine Core: Autonomous Workload Orchestration & Predictive Capacity Management.

    This class embodies the cognitive core for orchestrating compute resources, acting as the
    self-governing brain of the entire computational fabric. It dynamically manages workloads,
    ensures instances are perfectly right-sized, and precisely predicts future capacity needs
    through advanced AI. This module guarantees peak performance, maximizes cost efficiency,
    and ensures unwavering reliability across all distributed workloads within the platform.
    """
    def __init__(self, gemini_client: MockGeminiAPIClient):
        """
        Initializes the WorkloadScheduler with a Gemini API client for advanced AI-driven decisions.

        Args:
            gemini_client (MockGeminiAPIClient): An instance of the simulated Gemini API client,
                                                 serving as the AI backend for complex scheduling and optimization logic.
        """
        self.gemini_client = gemini_client
        self.workloads: Dict[str, Workload] = {}
        self.compute_resources: Dict[str, ComputeResource] = {}
        self._current_schedule: List[Dict[str, Any]] = []  # Stores the most recent AI-generated assignments
        print("WorkloadScheduler initialized: Ready to orchestrate the computational fabric with AI precision and foresight.")

    def add_workload(self, workload: Workload) -> None:
        """
        Adds a new workload to the scheduler's queue, making it available for future or immediate orchestration.
        Args:
            workload (Workload): The workload object to be managed by the scheduler.
        """
        if workload.id in self.workloads:
            raise ValueError(f"Workload with ID '{workload.id}' already exists. Workload IDs must be unique.")
        self.workloads[workload.id] = workload
        print(f"  Added workload: '{workload.id}' (Priority: {workload.priority.name}, CPU: {workload.cpu_required}, Mem: {workload.memory_required_gb}GB)")

    def add_resource(self, resource: ComputeResource) -> None:
        """
        Adds a new compute resource to the pool of available infrastructure that the scheduler can utilize.
        Args:
            resource (ComputeResource): The compute resource object to add to the managed pool.
        """
        if resource.id in self.compute_resources:
            raise ValueError(f"Resource with ID '{resource.id}' already exists. Resource IDs must be unique.")
        self.compute_resources[resource.id] = resource
        print(f"  Added resource: '{resource.id}' (Total CPU: {resource.total_cpu}, Total Mem: {resource.total_memory_gb}GB, Spot: {resource.is_spot_instance})")

    def _get_active_and_pending_workloads(self) -> List[Workload]:
        """
        Retrieves all workloads that are currently pending, scheduled, or running.
        These are the workloads that the AI needs to consider for the next scheduling cycle,
        ensuring continuous optimization.
        """
        return [w for w in self.workloads.values() if w.status in [WorkloadStatus.PENDING, WorkloadStatus.SCHEDULED, WorkloadStatus.RUNNING]]

    def _get_available_resources(self) -> List[ComputeResource]:
        """
        Retrieves all compute resources currently available for allocation.
        In a real production system, this would involve integrating with a health monitoring
        system to filter out unhealthy or decommissioned resources.
        """
        return list(self.compute_resources.values())

    def schedule_workloads(self) -> Dict[str, Any]:
        """
        Generates and continuously optimizes a global schedule for all active and pending workloads
        across the entire computational fabric. This function serves as the central orchestration
        point, offloading complex combinatorial optimization to the Gemini AI. It intelligently
        considers workload priorities, deadlines, data locality, and cost sensitivity to maximize
        resource utilization, minimize operational costs, and guarantee critical workload SLAs.

        Returns:
            Dict[str, Any]: A structured dictionary containing the AI-generated schedule,
                            a list of any unallocated workloads, a detailed rationale
                            for the scheduling decisions, and the optimized states of resources.
        """
        print("\n[Scheduler] Orchestrating new workload schedule using AI-driven optimization...")
        
        # Prepare input for the Gemini AI, serializing workloads and resources into dictionaries.
        # This mirrors how data would be sent via an API call.
        gemini_input_data = {
            "workloads": [dataclasses.asdict(w) for w in self._get_active_and_pending_workloads()],
            "resources": [dataclasses.asdict(r) for r in self._get_available_resources()],
            "existing_schedule": self._current_schedule, # Provides context for incremental AI optimization
        }

        # Define the expected structure (responseSchema) of Gemini's output.
        # This contract is vital for machine-readable, reliable, and automatable AI responses.
        response_schema = {
            "type": "object",
            "properties": {
                "schedule": {
                    "type": "array",
                    "description": "List of optimized workload-to-resource assignments.",
                    "items": {
                        "type": "object",
                        "properties": {
                            "workload_id": {"type": "string", "description": "Unique ID of the assigned workload."},
                            "resource_id": {"type": "string", "description": "Unique ID of the resource it's assigned to."},
                            "estimated_cost": {"type": "number", "description": "Estimated cost incurred by this specific assignment."},
                            "reason": {"type": "string", "description": "Detailed rationale for this particular assignment choice."}
                        },
                        "required": ["workload_id", "resource_id", "estimated_cost", "reason"]
                    }
                },
                "unallocated_workloads": {
                    "type": "array",
                    "description": "List of workload IDs that could not be allocated in the current cycle.",
                    "items": {"type": "string"}
                },
                "rationale": {"type": "string", "description": "An overall explanation and justification for the entire AI-generated schedule."},
                "optimized_resource_states": {
                    "type": "array",
                    "description": "The updated state of all resources after applying the optimized schedule, reflecting current allocations.",
                    "items": {
                        "type": "object", # In a real schema, this would be a detailed definition of ComputeResource
                    }
                }
            },
            "required": ["schedule", "rationale", "optimized_resource_states"]
        }

        prompt = (
            "Given the comprehensive details of current compute resources (including CPU, Memory, Cost profiles, "
            "Location, and Spot instance availability) and a dynamic set of pending and running workloads "
            "(detailing resource requirements, priority, deadlines, data locality preferences, and cost sensitivity), "
            "your mission is to generate and continually optimize a global schedule. This schedule must achieve "
            "maximum resource utilization and rigorously ensure that all critical workloads meet their Service Level Agreements (SLAs), "
            "concurrently minimizing operational costs. Strategically leverage spot instances for appropriate, cost-sensitive tasks. "
            "Provide a comprehensive, highly detailed rationale for the generated schedule, illuminating the 'why' "
            "behind key decisions, and clearly identify any workloads that could not be allocated due to current constraints, "
            "along with potential reasons."
        )

        ai_response = self.gemini_client.generateContent(
            prompt=prompt,
            response_schema=response_schema,
            input_data=gemini_input_data
        )

        self._current_schedule = ai_response.get("schedule", [])
        unallocated = ai_response.get("unallocated_workloads", [])
        rationale = ai_response.get("rationale", "AI provided no specific rationale for this scheduling cycle.")
        optimized_resource_states = ai_response.get("optimized_resource_states", [])

        print(f"\n[Scheduler] AI-Generated Schedule Rationale:\n    {rationale}")
        
        # Apply the AI's optimized schedule to the internal state of the scheduler,
        # ensuring the system reflects the AI's intelligent orchestration decisions.
        self._apply_schedule(self._current_schedule, optimized_resource_states)
        
        if unallocated:
            print(f"  [Scheduler Warning] {len(unallocated)} workloads could not be allocated: {', '.join(unallocated)}")

        return ai_response

    def _apply_schedule(self, schedule: List[Dict[str, Any]], optimized_resource_states: List[Dict[str, Any]]) -> None:
        """
        Applies the AI-generated schedule to the internal state of workloads and resources.
        This method translates the AI's abstract optimization decisions into concrete updates
        within the scheduler's operational view, simulating autonomous execution.
        """
        print("\n[Scheduler] Applying AI-generated schedule to update system state and resource allocations...")
        
        # Update resource states first based on the AI's final, optimized view.
        # This ensures internal resource representations are consistent with the AI's allocation.
        for res_state in optimized_resource_states:
            res_id = res_state['id']
            if res_id in self.compute_resources:
                resource = self.compute_resources[res_id]
                # Directly update all relevant resource fields from the AI's calculated state
                resource.available_cpu = res_state['available_cpu']
                resource.available_memory_gb = res_state['available_memory_gb']
                resource.current_workloads = res_state['current_workloads'] # AI knows current allocations
                resource.load_factor = res_state['load_factor']
            else:
                print(f"  [Scheduler Warning] Resource '{res_id}' from AI-optimized state not found in local resources. It might have failed or been de-provisioned concurrently.")

        # Reset all workload assignments before applying the new schedule to ensure clean state.
        for workload in self.workloads.values():
            workload.assigned_resource_id = None
            if workload.status == WorkloadStatus.RUNNING: # If it was running, put it to pending for re-evaluation
                workload.status = WorkloadStatus.PENDING
            if workload.status == WorkloadStatus.SCHEDULED: # If it was scheduled, also put it to pending
                workload.status = WorkloadStatus.PENDING
        
        # Now apply the new assignments generated by the AI
        for assignment in schedule:
            workload_id = assignment["workload_id"]
            resource_id = assignment["resource_id"]

            workload = self.workloads.get(workload_id)
            resource = self.compute_resources.get(resource_id)

            if workload and resource:
                workload.assigned_resource_id = resource_id
                workload.status = WorkloadStatus.RUNNING # Assume successful transition to running upon AI allocation
                if not workload.start_time: # Only set start time if it's a completely new assignment
                    workload.start_time = time.time()
                print(f"  Workload '{workload.id}' is now running on '{resource.id}'.")
            else:
                print(f"  [Scheduler Warning] AI assignment for unknown workload '{workload_id}' or resource '{resource_id}' was skipped during application.")

    def adapt_schedule(self,
                       new_workloads: Optional[List[Workload]] = None,
                       failed_resource_ids: Optional[List[str]] = None,
                       updated_resource_metrics: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Adapts the current schedule in real-time to unforeseen changes, such as new workload arrivals,
        resource failures, or dynamic shifts in resource performance and load. This method triggers a
        re-evaluation and re-optimization by the AI, ensuring the computational fabric remains
        continuously responsive, resilient, and efficiently managed.

        Args:
            new_workloads (Optional[List[Workload]]): A list of newly arrived workloads to be immediately incorporated into the scheduling process.
            failed_resource_ids (Optional[List[str]]): A list of resource IDs that have recently experienced failures and need to be de-provisioned.
            updated_resource_metrics (Optional[Dict[str, Any]]): Real-time updates to resource performance or load metrics, informing the AI's decisions.

        Returns:
            Dict[str, Any]: The updated schedule and rationale generated by the AI after performing the adaptation.
        """
        print("\n[Scheduler] Initiating real-time schedule adaptation to dynamic changes across the compute landscape...")

        # Step 1: Incorporate any newly arrived workloads into the scheduler's pool.
        if new_workloads:
            for wl in new_workloads:
                self.add_workload(wl)
            print(f"  Incorporated {len(new_workloads)} new workloads for immediate adaptation.")

        # Step 2: Handle resource failures, deallocating workloads and removing failed resources.
        if failed_resource_ids:
            for res_id in failed_resource_ids:
                if res_id in self.compute_resources:
                    print(f"  Resource '{res_id}' detected as failed. Initiating re-assignment of its workloads.")
                    failed_resource = self.compute_resources[res_id]
                    for wl_id in failed_resource.current_workloads:
                        workload = self.workloads.get(wl_id)
                        if workload:
                            workload.status = WorkloadStatus.PENDING  # Mark affected workloads for immediate rescheduling
                            workload.assigned_resource_id = None
                    del self.compute_resources[res_id] # Permanently remove the failed resource from the available pool
                else:
                    print(f"  [Scheduler Warning] Failed resource '{res_id}' not found in known resources; skipping its processing during adaptation.")

        # Step 3: Apply any real-time updates to existing resource metrics.
        if updated_resource_metrics:
            for res_id, metrics in updated_resource_metrics.items():
                if res_id in self.compute_resources:
                    resource = self.compute_resources[res_id]
                    if 'available_cpu' in metrics: resource.available_cpu = metrics['available_cpu']
                    if 'available_memory_gb' in metrics: resource.available_memory_gb = metrics['available_memory_gb']
                    if 'load_factor' in metrics: resource.load_factor = metrics['load_factor']
                    resource.last_heartbeat = time.time() # Update last known healthy status
                    print(f"  Updated real-time metrics for resource '{res_id}'.")
                else:
                    print(f"  [Scheduler Warning] Metrics provided for unknown resource '{res_id}'; skipping during adaptation.")
        
        # Step 4: Leverage Gemini's streaming capabilities to provide real-time insights
        # into the ongoing adaptation process, enhancing observability.
        self.gemini_client.generateContentStream(
            "Provide real-time insights on optimizing the schedule in response to dynamic events "
            "(e.g., new workloads, resource failures, performance degradation, and evolving demand patterns)."
        )

        # Step 5: Trigger a full scheduling cycle to re-optimize with the new conditions.
        # This ensures all changes are holistically considered by the AI for optimal placement.
        return self.schedule_workloads()

    def preempt_workload(self, preempt_id: str, new_critical_workload: Workload) -> Dict[str, Any]:
        """
        Simulates the preemption of a lower-priority workload to create immediate capacity
        for a new, critical workload. The AI is leveraged to provide a robust justification
        for this action and guide the immediate follow-up steps, ensuring transparency and
        optimal system behavior even under high-priority demands.

        Args:
            preempt_id (str): The unique ID of the workload targeted for preemption.
            new_critical_workload (Workload): The new critical workload that requires immediate allocation
                                              and necessitates the preemption.

        Returns:
            Dict[str, Any]: An AI-generated dictionary containing the justification for preemption
                            and suggested follow-up actions for the preempted workload.
        """
        print(f"\n[Scheduler] Initiating preemption of workload '{preempt_id}' to accommodate "
              f"new critical workload '{new_critical_workload.id}' (Priority: {new_critical_workload.priority.name}).")
        
        preempt_workload = self.workloads.get(preempt_id)

        # Validate if the target workload for preemption exists and is active.
        if not preempt_workload or preempt_workload.status not in [WorkloadStatus.RUNNING, WorkloadStatus.SCHEDULED]:
            return {"status": "error", "message": f"Workload '{preempt_id}' not found or not in an active state for preemption; cannot proceed."}

        # Step 1: Engage Gemini AI to provide a comprehensive justification for the preemption
        # and recommend optimal immediate actions for both workloads.
        ai_response = self.gemini_client.generateContent(
            prompt=f"Perform a detailed root cause analysis and provide a robust, executive-level justification for preempting "
                   f"workload '{preempt_id}' to immediately accommodate the new, higher-priority critical workload '{new_critical_workload.id}'. "
                   f"Furthermore, suggest immediate, optimal actions to minimize any disruption caused by the preemption and "
                   f"facilitate the smooth re-integration or rescheduling of the preempted task.",
            response_schema={
                "type": "object",
                "properties": {
                    "preemption_justification": {"type": "string", "description": "Detailed AI-generated explanation for the preemption decision."},
                    "action_taken": {"type": "string", "description": "Immediate AI-recommended actions taken or to be taken for both workloads."}
                },
                "required": ["preemption_justification", "action_taken"]
            },
            input_data={
                "preempted_workload_id": preempt_id,
                "new_critical_workload_id": new_critical_workload.id,
                "preempted_workload_details": dataclasses.asdict(preempt_workload) # Provide context to the AI
            }
        )

        justification = ai_response.get("preemption_justification", "AI provided no specific justification for preemption.")
        action_taken = ai_response.get("action_taken", "AI provided no specific action recommendations.")
        print(f"  [Scheduler] AI Preemption Justification:\n    {justification}")
        print(f"  [Scheduler] AI Suggested Action: {action_taken}")

        # Step 2: Perform the actual preemption within the scheduler's state.
        if preempt_workload.assigned_resource_id:
            resource = self.compute_resources.get(preempt_workload.assigned_resource_id)
            if resource:
                try:
                    resource.deallocate(preempt_workload)
                    print(f"  Workload '{preempt_id}' successfully deallocated from '{resource.id}'.")
                except ValueError as e:
                    print(f"  [Scheduler Error] Failed to deallocate '{preempt_id}' from '{resource.id}': {e}")
            else:
                print(f"  [Scheduler Warning] Resource '{preempt_workload.assigned_resource_id}' (for '{preempt_id}') not found during deallocation.")
        
        preempt_workload.status = WorkloadStatus.PREEMPTED # Mark the workload as preempted
        preempt_workload.assigned_resource_id = None # Clear its assignment

        # Step 3: Add the new critical workload to the pool.
        self.add_workload(new_critical_workload)
        
        # Step 4: Trigger a full scheduling cycle. This ensures the critical workload is immediately
        # prioritized and placed, and the preempted workload is properly re-evaluated for re-queuing
        # or migration based on available capacity and its original priority.
        self.schedule_workloads()
        
        return ai_response