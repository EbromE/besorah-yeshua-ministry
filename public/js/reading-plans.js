[file name]: public/js/reading-plans.js
[file content
// Reading Plans Manager
// Handles different Bible reading plans

const ReadingPlans = {
    // Plans data (loaded from JSON files)
    nt90Plan: [],
    ot365Plan: [],
    ethiopianPlan: [],
    
    // Current plan type
    currentPlanType: 'nt90',
    
    // Get reading for a specific date
    getReadingForDate(date, planType = null) {
        if (planType) {
            this.currentPlanType = planType;
        } else {
            this.currentPlanType = StorageManager.getCurrentPlan();
        }
        
        switch(this.currentPlanType) {
            case 'nt90':
                return this.getNT90Reading(date);
            case 'ot365':
                return this.getOT365Reading(date);
            case 'ethiopian':
                return this.getEthiopianReading(date);
            default:
                return this.getNT90Reading(date);
        }
    },

    // Get NT90 reading
    getNT90Reading(date) {
        if (this.nt90Plan.length === 0) {
            return this.getFallbackReading(date, 90, 'NT');
        }
        
        const dayNumber = this.calculateDayNumber(date, 90);
        const reading = this.nt90Plan.find(r => r.day === dayNumber);
        
        if (reading) {
            return {
                day: reading.day,
                title: `Day ${reading.day}: ${reading.theme}`,
                passages: [reading.reading],
                theme: reading.theme,
                chapters: reading.chapters || 3
            };
        }
        
        return this.getFallbackReading(date, 90, 'NT');
    },

    // Get OT365 reading
    getOT365Reading(date) {
        if (this.ot365Plan.length === 0) {
            return this.getFallbackReading(date, 365, 'OT');
        }
        
        const dayNumber = this.calculateDayNumber(date, 365);
        const reading = this.ot365Plan.find(r => r.day === dayNumber);
        
        if (reading) {
            return {
                day: reading.day,
                title: `Day ${reading.day}: ${reading.theme}`,
                passages: [reading.reading],
                theme: reading.theme,
                month: reading.month,
                focus: reading.focus,
                chapters: reading.chapters || 3
            };
        }
        
        return this.getFallbackReading(date, 365, 'OT');
    },

    // Get Ethiopian calendar reading
    getEthiopianReading(date) {
        if (this.ethiopianPlan.length === 0) {
            return this.getFallbackReading(date, 365, 'OT');
        }
        
        // For Ethiopian calendar, we need to convert date
        // For now, use simplified calculation
        const dayNumber = this.calculateDayNumber(date, 365);
        let reading = null;
        
        // Find reading in Ethiopian plan structure
        for (const month of this.ethiopianPlan) {
            if (month.readings) {
                const monthReading = month.readings.find(r => r.day === (dayNumber % 30 || 30));
                if (monthReading) {
                    reading = {
                        ...monthReading,
                        month: month.name,
                        feast: monthReading.feast || month.feast
                    };
                    break;
                }
            }
        }
        
        if (reading) {
            return {
                day: reading.day,
                title: `${reading.month} ${reading.day}${reading.feast ? ` - ${reading.feast}` : ''}`,
                passages: [reading.reading],
                theme: reading.theme,
                feast: reading.feast,
                chapters: reading.chapters || 3
            };
        }
        
        return this.getFallbackReading(date, 365, 'OT');
    },

    // Calculate day number based on date
    calculateDayNumber(date, totalDays) {
        // Get start date from storage or use January 1
        let startDate = StorageManager.getStartDate(this.currentPlanType);
        
        if (!startDate) {
            // If no start date stored, use today as day 1
            startDate = new Date(date);
            StorageManager.setStartDate(this.currentPlanType, startDate);
            return 1;
        }
        
        // Convert to Date object if it's a string
        if (typeof startDate === 'string') {
            startDate = new Date(startDate);
        }
        
        const diffTime = Math.abs(date - startDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Return day number (1-totalDays)
        return (diffDays % totalDays) + 1;
    },

    // Fallback reading if plan not loaded
    getFallbackReading(date, totalDays, testament = 'NT') {
        const dayNumber = this.calculateDayNumber(date, totalDays);
        
        if (testament === 'OT') {
            return {
                day: dayNumber,
                title: `OT365 Day ${dayNumber}`,
                passages: ['Genesis 1-3'],
                theme: 'God Creates the World',
                chapters: 3
            };
        } else {
            return {
                day: dayNumber,
                title: `NT90 Day ${dayNumber}`,
                passages: ['Matthew 1-4'],
                theme: 'Birth & Early Ministry',
                chapters: 4
            };
        }
    },

    // Load plan from JSON file
    async loadPlanFromFile(planType) {
        try {
            const fileMap = {
                'nt90': '/data/reading-plans/nt90.json',
                'ot365': '/data/reading-plans/ot365.json',
                'ethiopian': '/data/reading-plans/ethiopian-calendar.json'
            };
            
            const filePath = fileMap[planType];
            if (!filePath) {
                console.warn(`Unknown plan type: ${planType}`);
                return false;
            }
            
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            switch(planType) {
                case 'nt90':
                    this.nt90Plan = data.schedule || [];
                    break;
                case 'ot365':
                    this.ot365Plan = this.flattenOT365Plan(data);
                    break;
                case 'ethiopian':
                    this.ethiopianPlan = data.months || [];
                    break;
            }
            
            console.log(`Loaded ${planType} plan with ${this.getPlanLength(planType)} readings`);
            return true;
        } catch (error) {
            console.warn(`Could not load ${planType} plan:`, error.message);
            return false;
        }
    },

    // Get plan length
    getPlanLength(planType) {
        switch(planType) {
            case 'nt90': return this.nt90Plan.length;
            case 'ot365': return this.ot365Plan.length;
            case 'ethiopian': return this.ethiopianPlan.length;
            default: return 0;
        }
    },

    // Flatten OT365 monthly structure to daily array
    flattenOT365Plan(data) {
        const flatPlan = [];
        
        if (data.monthlyPlans && Array.isArray(data.monthlyPlans)) {
            data.monthlyPlans.forEach(monthPlan => {
                if (monthPlan.days && Array.isArray(monthPlan.days)) {
                    monthPlan.days.forEach(day => {
                        flatPlan.push({
                            day: day.day,
                            reading: day.reading,
                            theme: day.theme,
                            month: monthPlan.month,
                            focus: monthPlan.focus,
                            chapters: day.chapters || 3
                        });
                    });
                }
            });
        }
        
        // Sort by day number
        flatPlan.sort((a, b) => a.day - b.day);
        return flatPlan;
    },

    // Get plan information
    getPlanInfo(planType) {
        const info = {
            'nt90': {
                name: '90-Day New Testament',
                days: 90,
                description: 'Read through the New Testament in 90 days',
                totalChapters: 260,
                avgChaptersPerDay: 2.89
            },
            'ot365': {
                name: 'OT365 Challenge',
                days: 365,
                description: 'Read entire Old Testament in one year',
                totalChapters: 929,
                avgChaptersPerDay: 2.54
            },
            'ethiopian': {
                name: 'Ethiopian Calendar Plan',
                days: 365,
                description: 'Bible reading following Ethiopian calendar',
                totalChapters: 929,
                avgChaptersPerDay: 2.54
            }
        };
        
        return info[planType] || info.nt90;
    },

    // Get reading statistics for current plan
    getReadingStats(planType) {
        const info = this.getPlanInfo(planType);
        const completed = StorageManager.getCompletedReadings().length;
        const percent = Math.round((completed / info.days) * 100);
        
        return {
            totalDays: info.days,
            completed: completed,
            percent: percent,
            remaining: info.days - completed,
            avgChaptersPerDay: info.avgChaptersPerDay
        };
    },

    // Get suggested reading time
    getSuggestedTime(planType) {
        const info = this.getPlanInfo(planType);
        const minutes = Math.ceil(info.avgChaptersPerDay * 5);
        return `${minutes}-${minutes + 10} minutes`;
    },

    // Initialize all plans
    async init() {
        // Load plans in parallel
        const loadPromises = [
            this.loadPlanFromFile('nt90'),
            this.loadPlanFromFile('ot365'),
            this.loadPlanFromFile('ethiopian')
        ];
        
        const results = await Promise.allSettled(loadPromises);
        
        results.forEach((result, index) => {
            const planTypes = ['nt90', 'ot365', 'ethiopian'];
            if (result.status === 'rejected') {
                console.warn(`Failed to load ${planTypes[index]} plan:`, result.reason);
            }
        });
        
        console.log('Reading plans initialized');
    }
};

// Initialize planner with error handling
async function initializePlanner() {
    try {
        // Load reading plans
        await ReadingPlans.init();
        
        // Initialize calendar
        if (typeof CalendarManager !== 'undefined') {
            CalendarManager.init();
        }
        
        // Setup plan selector
        const planSelector = document.getElementById('readingPlan');
        if (planSelector) {
            // Clear existing options
            planSelector.innerHTML = '';
            
            // Add plan options
            const plans = [
                {value: 'nt90', text: '90-Day New Testament'},
                {value: 'ot365', text: 'OT365 Challenge (1-Year OT)'},
                {value: 'ethiopian', text: 'Ethiopian Calendar Plan'}
            ];
            
            plans.forEach(plan => {
                const option = document.createElement('option');
                option.value = plan.value;
                option.textContent = plan.text;
                planSelector.appendChild(option);
            });
            
            // Set current plan
            const currentPlan = StorageManager.getCurrentPlan();
            planSelector.value = currentPlan;
            
            // Add change listener
            planSelector.addEventListener('change', function(e) {
                const newPlan = e.target.value;
                StorageManager.setCurrentPlan(newPlan);
                
                // Reset start date when changing plans
                StorageManager.setStartDate(newPlan, new Date());
                
                // Update display if calendar exists
                if (typeof CalendarManager !== 'undefined') {
                    CalendarManager.selectDate(CalendarManager.selectedDate || new Date());
                }
                
                updateStatistics();
            });
        }
        
        // Setup reset button
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to reset all progress and notes? This cannot be undone.')) {
                    StorageManager.resetAll();
                    window.location.reload();
                }
            });
        }
        
        // Setup save notes button
        const saveNotesBtn = document.getElementById('saveNotes');
        if (saveNotesBtn) {
            saveNotesBtn.addEventListener('click', function() {
                const notesTextarea = document.getElementById('studyNotes');
                if (!notesTextarea) return;
                
                const notes = notesTextarea.value;
                const date = CalendarManager?.selectedDate || new Date();
                const success = StorageManager.saveStudyNotes(date, notes);
                
                if (success) {
                    // Show success feedback
                    const originalText = saveNotesBtn.textContent;
                    saveNotesBtn.textContent = '✓ Saved';
                    saveNotesBtn.classList.add('saved');
                    
                    setTimeout(() => {
                        saveNotesBtn.textContent = originalText;
                        saveNotesBtn.classList.remove('saved');
                    }, 2000);
                }
            });
        }
        
        // Select today's date if calendar exists
        if (typeof CalendarManager !== 'undefined') {
            CalendarManager.selectDate(new Date());
        }
        
        // Update statistics
        updateStatistics();
        
    } catch (error) {
        console.error('Error initializing planner:', error);
        // Show user-friendly error message
        const readingContainer = document.getElementById('todayReading');
        if (readingContainer) {
            readingContainer.innerHTML = `
                <div class="error-message">
                    <p>⚠️ Could not load reading plans. Please check your internet connection.</p>
                    <p>Using basic reading schedule...</p>
                </div>
            `;
        }
    }
}

// Export for global use
if (typeof window !== 'undefined') {
    window.ReadingPlans = ReadingPlans;
    window.initializePlanner = initializePlanner;
    window.updateStatistics = updateStatistics;
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePlanner);
    } else {
        initializePlanner();
    }
}
