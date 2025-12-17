// Reading Plans Manager
// Handles different Bible reading plans

const ReadingPlans = {
    // Plans data (loaded from JSON files)
    nt90Plan: [],
    ot365Plan: [],
    ethiopianPlan: [],
    
    // Current plan type
    currentPlanType: 'nt90',
    
    // Initialize - load all plans
    async init() {
        console.log('📖 Initializing reading plans...');
        
        try {
            // Load plans in parallel
            const loadPromises = [
                this.loadPlanFromFile('nt90'),
                this.loadPlanFromFile('ot365'),
                this.loadPlanFromFile('ethiopian')
            ];
            
            const results = await Promise.allSettled(loadPromises);
            
            results.forEach((result, index) => {
                const planTypes = ['nt90', 'ot365', 'ethiopian'];
                if (result.status === 'fulfilled' && result.value) {
                    console.log(`✅ ${planTypes[index]} plan loaded`);
                } else {
                    console.warn(`⚠️ ${planTypes[index]} plan failed to load:`, result.reason);
                }
            });
            
            // Set current plan from storage
            this.currentPlanType = StorageManager.getCurrentPlan();
            
            console.log('✅ Reading plans initialized');
            return true;
        } catch (error) {
            console.error('❌ Error initializing plans:', error);
            throw error;
        }
    },
    
    // Load plan from JSON file
    async loadPlanFromFile(planType) {
        const fileMap = {
            'nt90': 'data/reading-plans/nt90.json',
            'ot365': 'data/reading-plans/ot365.json',
            'ethiopian': 'data/reading-plans/ethiopian-calendar.json'
        };
        
        const filePath = fileMap[planType];
        if (!filePath) {
            throw new Error(`Unknown plan type: ${planType}`);
        }
        
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
            
            return true;
        } catch (error) {
            console.warn(`Could not load ${planType} plan from ${filePath}:`, error.message);
            return false;
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
        const dayNumber = this.calculateDayNumber(date, 90);
        
        if (this.nt90Plan.length === 0) {
            return this.getFallbackReading(date, 90, 'NT');
        }
        
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
        const dayNumber = this.calculateDayNumber(date, 365);
        
        if (this.ot365Plan.length === 0) {
            return this.getFallbackReading(date, 365, 'OT');
        }
        
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
        const dayNumber = this.calculateDayNumber(date, 365);
        
        if (this.ethiopianPlan.length === 0) {
            return this.getFallbackReading(date, 365, 'OT');
        }
        
        // Find reading in Ethiopian plan structure
        let reading = null;
        for (const month of this.ethiopianPlan) {
            if (month.readings) {
                const monthReading = month.readings.find(r => {
                    // Calculate cumulative day number for this reading
                    const monthIndex = this.ethiopianPlan.indexOf(month);
                    let daysSoFar = 0;
                    for (let i = 0; i < monthIndex; i++) {
                        daysSoFar += this.ethiopianPlan[i].readings?.length || 0;
                    }
                    const readingDayNumber = daysSoFar + r.day;
                    return readingDayNumber === dayNumber;
                });
                
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
                day: dayNumber,
                title: `${reading.month} Day ${reading.day}${reading.feast ? ` - ${reading.feast}` : ''}`,
                passages: [reading.reading],
                theme: reading.theme,
                month: reading.month,
                feast: reading.feast,
                chapters: reading.chapters || 3
            };
        }
        
        return this.getFallbackReading(date, 365, 'OT');
    },
    
    // Calculate day number based on date
    calculateDayNumber(date, totalDays) {
        // Get start date from storage
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
        
        // Calculate difference in days
        const diffTime = date.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Return day number (1-totalDays), cycling if needed
        return ((diffDays % totalDays) + totalDays) % totalDays + 1;
    },
    
    // Fallback reading if plan not loaded
    getFallbackReading(date, totalDays, testament = 'NT') {
        const dayNumber = this.calculateDayNumber(date, totalDays);
        
        if (testament === 'OT') {
            return {
                day: dayNumber,
                title: `OT365 Day ${dayNumber}`,
                passages: ['Genesis 1-3'],
                theme: 'Creation & Fall',
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
                description: 'Bible reading following Ethiopian calendar with feast days',
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
        return `${minutes}-${minutes + 10} min`;
    }
};

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.ReadingPlans = ReadingPlans;
}