/**
 * PDF Viewer Component with Date-Based Annotation Filtering
 *
 * This component integrates Nutrient Web SDK (formerly PSPDFKit) to provide a fully-featured
 * PDF viewer with custom annotation filtering capabilities based on creation dates.
 *
 * Features:
 * - Automatic date tagging for all created annotations
 * - Custom toolbar dropdown for date-based filtering
 * - Real-time annotation visibility control
 * - Support for multiple pages and annotation types
 *
 * @component
 * @author Narashiman (https://www.linkedin.com/in/narashimank/)
 */
import { useEffect, useRef } from "react";

/**
 * PdfViewerComponent
 *
 * @param {Object} props - Component properties
 * @param {string} props.document - URL or path to the PDF document to be loaded
 * @returns {JSX.Element} A div container that hosts the Nutrient PDF Viewer
 */
export default function PdfViewerComponent(props) {
	// Ref to hold the DOM container for the PDF viewer
	const containerRef = useRef(null);

	// Ref to hold the Nutrient Viewer instance for programmatic access
	const instanceRef = useRef(null);

	// Ref to store unique dates from all annotations (persists across re-renders)
	const availableDatesRef = useRef(new Set());

	useEffect(() => {
		const container = containerRef.current;
		let instance = null;
		const { NutrientViewer } = window;

		// Configuration for Nutrient Web SDK
		const config = {
			// License key from environment variables
			licenseKey: import.meta.env.VITE_lkey,
			// DOM container element
			container,
			// PDF document URL or path
			document: props.document,
			// Enable rich text editing for annotations
			enableRichText: () => true,
			// Enable undo/redo functionality
			enableHistory: true,
			// Enable clipboard operations (copy/paste)
			enableClipboardActions: true,
			// Allow progressive loading of PDF for better performance
			allowLinearizedLoading: true,
			// Prioritize fetching resources
			fetchPriority: "high",
			// Start with default toolbar items (will be customized later)
			toolbarItems: [...NutrientViewer.defaultToolbarItems],
		};

		/**
		 * Collects all unique dates from annotations across all pages
		 *
		 * This function scans through all pages in the document and extracts unique
		 * creation dates from annotation customData. These dates are used to populate
		 * the filter dropdown.
		 *
		 * @param {Object} instanceObj - The Nutrient Viewer instance
		 * @returns {Promise<Set<string>>} A Set of unique date strings (YYYY-MM-DD format)
		 */
		const collectAvailableDates = async (instanceObj) => {
			const dates = new Set();

			// Iterate through all pages in the document
			const pageCount = instanceObj.totalPageCount;
			for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
				const pageAnnotations = await instanceObj.getAnnotations(pageIndex);
				pageAnnotations.forEach((annotation) => {
					// Extract date from customData if it exists
					if (annotation.customData?.createdDate) {
						dates.add(annotation.customData.createdDate);
					}
				});
			}

			// Store in ref for persistence
			availableDatesRef.current = dates;
			return dates;
		};

		/**
		 * Creates a custom dropdown toolbar item for date filtering
		 *
		 * This function generates a styled HTML select element that is integrated into
		 * the Nutrient toolbar. The dropdown allows users to filter annotations by their
		 * creation date.
		 *
		 * @param {Set<string>} dates - Set of unique dates to populate the dropdown
		 * @returns {Object} Custom toolbar item configuration object
		 */
		const createDateFilterDropdown = (dates) => {
			// Create the select element
			const selectNode = document.createElement("select");
			selectNode.id = "date-filter-dropdown";

			// Apply inline styles for toolbar integration
			selectNode.style.cssText = `
        padding: 6px 12px;
        border-radius: 4px;
        border: 1px solid #ccc;
        background-color: white;
        cursor: pointer;
        font-size: 14px;
        margin: 0 8px;
      `;

			// Add "All Annotations" option as default
			const allOption = document.createElement("option");
			allOption.value = "all";
			allOption.textContent = "All Annotations";
			selectNode.appendChild(allOption);

			// Add date options in sorted order
			Array.from(dates)
				.sort()
				.forEach((date) => {
					const option = document.createElement("option");
					option.value = date;
					option.textContent = date;
					selectNode.appendChild(option);
				});

			// Attach change event listener to trigger filtering
			selectNode.addEventListener("change", async (e) => {
				const selectedDate = e.target.value;
				await filterAnnotationsByDate(instance, selectedDate);
			});

			// Return custom toolbar item configuration
			return {
				type: "custom",
				id: "date-filter",
				title: "Filter by Date",
				node: selectNode,
			};
		};

		/**
		 * Filters annotations by date across all pages
		 *
		 * This function controls annotation visibility based on the selected date filter.
		 * It uses the 'hidden' property to show/hide annotations without deleting them.
		 *
		 * Algorithm:
		 * - If "all" is selected: Show all annotations
		 * - If a specific date is selected: Show only annotations with matching date,
		 *   hide all others
		 *
		 * @param {Object} instanceObj - The Nutrient Viewer instance
		 * @param {string} dateFilter - Selected date filter ("all" or "YYYY-MM-DD")
		 * @returns {Promise<void>}
		 */
		const filterAnnotationsByDate = async (instanceObj, dateFilter) => {
			if (!instanceObj) return;

			console.log(`Filtering annotations by date: ${dateFilter}`);
			const pageCount = instanceObj.totalPageCount;

			// Iterate through all pages
			for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
				const annotations = await instanceObj.getAnnotations(pageIndex);

				// Process each annotation sequentially to ensure proper async handling
				for (const annotation of annotations.toArray()) {
					const annotationDate = annotation.customData?.createdDate;

					console.log(
						`Annotation ID: ${annotation.id}, Date: ${annotationDate}, Current hidden: ${annotation.hidden}`,
					);

					if (dateFilter === "all") {
						// Show all annotations by setting hidden to false
						if (annotation.hidden) {
							await instanceObj.update(annotation.set("hidden", false));
							console.log(`Showing annotation ${annotation.id}`);
						}
					} else {
						// Show only annotations matching the selected date
						if (annotationDate === dateFilter) {
							// Show matching annotation
							if (annotation.hidden) {
								await instanceObj.update(annotation.set("hidden", false));
								console.log(
									`Showing annotation ${annotation.id} with matching date ${annotationDate}`,
								);
							}
						} else {
							// Hide non-matching annotation
							if (!annotation.hidden) {
								await instanceObj.update(annotation.set("hidden", true));
								console.log(
									`Hiding annotation ${annotation.id} with non-matching date ${annotationDate}`,
								);
							}
						}
					}
				}
			}
			console.log("Filtering complete");
		};

		/**
		 * Updates the date filter dropdown with new dates
		 *
		 * This function is called whenever annotations are created or deleted to ensure
		 * the dropdown stays synchronized with available dates. If the dropdown doesn't
		 * exist (e.g., on first annotation creation), it recreates the toolbar item.
		 *
		 * @param {Set<string>} dates - Updated set of unique dates
		 * @returns {void}
		 */
		const updateDateDropdown = (dates) => {
			const selectElement = document.getElementById("date-filter-dropdown");

			// If dropdown doesn't exist yet, recreate the toolbar with it
			if (!selectElement) {
				console.log("Dropdown not found, recreating toolbar");
				if (instance) {
					instance.setToolbarItems((items) => {
						// Remove any existing date filter to avoid duplicates
						const filteredItems = items.filter((item) => item.id !== "date-filter");
						const dateFilterItem = createDateFilterDropdown(dates);
						return [...filteredItems, dateFilterItem];
					});
				}
				return;
			}

			// Store current selection to restore after update
			const currentSelection = selectElement.value;

			// Clear all existing options
			selectElement.innerHTML = "";

			// Re-add "All Annotations" option
			const allOption = document.createElement("option");
			allOption.value = "all";
			allOption.textContent = "All Annotations";
			selectElement.appendChild(allOption);

			// Add sorted date options
			Array.from(dates)
				.sort()
				.forEach((date) => {
					const option = document.createElement("option");
					option.value = date;
					option.textContent = date;
					selectElement.appendChild(option);
				});

			// Restore previous selection if it still exists in the list
			if (Array.from(dates).includes(currentSelection) || currentSelection === "all") {
				selectElement.value = currentSelection;
			}

			console.log(`Dropdown updated with ${dates.size} dates:`, Array.from(dates));
		};

		/**
		 * Prompts user to enter a custom date for testing purposes
		 *
		 * This function displays a browser prompt dialog when an annotation is created,
		 * allowing users to assign custom dates for testing the filtering functionality.
		 * In production, this could be replaced with automatic date assignment or a
		 * custom date picker UI.
		 *
		 * @returns {string} Date string in YYYY-MM-DD format (defaults to today)
		 */
		const promptForCustomDate = () => {
			const customDate = window.prompt(
				"Enter a custom date for this annotation (format: YYYY-MM-DD):",
				new Date().toISOString().split("T")[0],
			);
			return customDate || new Date().toISOString().split("T")[0];
		};

		/**
		 * Initializes and configures the Nutrient Viewer
		 *
		 * This is the main initialization function that:
		 * 1. Loads the Nutrient Viewer with configuration
		 * 2. Sets up the custom date filter dropdown
		 * 3. Registers event listeners for annotation lifecycle events
		 * 4. Handles automatic date tagging for new annotations
		 *
		 * @returns {Promise<void>}
		 */
		const loadViewer = async () => {
			if (!container || !NutrientViewer) return;

			try {
				// Clean up any existing instance to prevent memory leaks
				try {
					await NutrientViewer.unload(container);
				} catch {
					// Ignore errors if no instance exists
				}

				// Load the Nutrient Viewer with the configuration
				instance = await NutrientViewer.load(config);
				instanceRef.current = instance;

				console.log("Nutrient Viewer loaded successfully", instance);

				// Collect any existing dates from pre-existing annotations
				const dates = await collectAvailableDates(instance);

				// Add the custom date filter dropdown to the toolbar
				instance.setToolbarItems((items) => {
					const dateFilterItem = createDateFilterDropdown(dates);
					return [...items, dateFilterItem];
				});

				/**
				 * Event listener: annotations.create
				 * Triggered when new annotations are created by the user
				 * Automatically assigns a date to the annotation's customData
				 */
				instance.addEventListener("annotations.create", async (annotations) => {
					console.log("Annotations created:", annotations.toJS());

					// Process each newly created annotation
					for (const annotation of annotations.toArray()) {
						// Prompt user for custom date (for testing)
						const customDate = promptForCustomDate();

						// Create updated annotation with customData containing date
						const updatedAnnotation = annotation.set("customData", {
							createdDate: customDate,
							timestamp: new Date().toISOString(),
						});

						// Save the updated annotation
						await instance.update(updatedAnnotation);

						console.log(`Annotation updated with date: ${customDate}`);

						// Update the date collection
						const newDates = new Set(availableDatesRef.current);
						newDates.add(customDate);
						availableDatesRef.current = newDates;

						// Refresh the dropdown to include the new date
						updateDateDropdown(newDates);
					}
				});

				/**
				 * Event listener: annotations.update
				 * Triggered when annotations are modified
				 */
				instance.addEventListener("annotations.update", (annotations) => {
					console.log("Annotations updated:", annotations.toJS());
				});

				/**
				 * Event listener: annotations.delete
				 * Triggered when annotations are deleted
				 * Updates the dropdown to remove dates that no longer have annotations
				 */
				instance.addEventListener("annotations.delete", async () => {
					const dates = await collectAvailableDates(instance);
					updateDateDropdown(dates);
				});
			} catch (error) {
				console.error("Error loading Nutrient Viewer:", error);
			}
		};

		// Initialize the viewer
		loadViewer();

		/**
		 * Cleanup function
		 * Runs when component unmounts or document prop changes
		 * Ensures proper cleanup of Nutrient Viewer instance
		 */
		return () => {
			if (container && NutrientViewer) {
				try {
					NutrientViewer.unload(container);
				} catch {
					// Ignore errors during cleanup
				}
			}
		};
	}, [props.document]); // Re-run effect when document URL changes

	// Render the container div for the Nutrient Viewer
	return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
}
