[file name]: public/js/storage.js
[file content begin]
// Local Storage Manager for Bible Planner
// Stores user progress, notes, and preferences locally

const StorageManager = {
    // Keys
    KEYS: {
        COMPLETED_READINGS: 'bible_completed_readings',
        STUDY_NOTES: 'bible_study_notes',
        CURRENT_PLAN: 'bible_current_plan',
        CALENDAR_TYPE: 'bible_calendar_type',
        STREAK_DATA: 'bible_streak_data',
        START_DATE_NT90: 'bible_start_date_nt90',
        START_DATE_OT365: 'bible_start_date_ot365',
        START_DATE_ETHIOPIAN: 'bible_start_date_ethiopian'
    },

    // Get completed readings
    getCompletedReadings() {
        try {
            const data = localStorage.getItem(this.KEYS.COMPLETED_READINGS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading completed readings:', error);
            return [];
        }
    },

    // Mark reading as complete
    markComplete(date) {
        const completed = this.getCompletedReadings();
        const dateStr = this.formatDate(date);
        
        if (!completed.includes(dateStr)) {
            completed.push(dateStr);
            this.saveCompletedReadings(completed);
            this.updateStreak(dateStr);
        }
    },

    // Unmark reading
    unmarkComplete(date) {
        const completed = this.getCompletedReadings();
        const dateStr = this.formatDate(date);
        const index = completed.indexOf(dateStr);
        
        if (index > -1) {
            completed.splice(index, 1);
            this.saveCompletedReadings(completed);
        }
    },

    // Check if date is completed
    isComplete(date) {
        const completed = this.getCompletedReadings();
        const dateStr = this.formatDate(date);
        return completed.includes(dateStr);
    },

    // Save completed readings
    saveCompletedReadings(completed) {
        try {
            localStorage.setItem(this.KEYS.COMPLETED_READINGS, JSON.stringify(completed));
        } catch (error) {
            console.error('Error saving completed readings:', error);
        }
    },

    // Get study notes for a date
    getStudyNotes(date) {
        try {
            const dateStr = this.formatDate(date);
            const allNotes = localStorage.getItem(this.KEYS.STUDY_NOTES);
            const notesObj = allNotes ? JSON.parse(allNotes) : {};
            return notesObj[dateStr] || '';
        } catch (error) {
            console.error('Error loading study notes:', error);
            return '';
        }
    },

    // Save study notes for a date
    saveStudyNotes(date, notes) {
        try {
            const dateStr = this.formatDate(date);
            const allNotes = localStorage.getItem(this.KEYS.STUDY_NOTES);
            const notesObj = allNotes ? JSON.parse(allNotes) : {};
            
            if (notes.trim()) {
                notesObj[dateStr] = notes;
            } else {
                delete notesObj[dateStr];
            }
            
            localStorage.setItem(this.KEYS.STUDY_NOTES, JSON.stringify(notesObj));
            return true;
        } catch (error) {
            console.error('Error saving study notes:', error);
            return false;
        }
    },

    // Get current reading plan
    getCurrentPlan() {
        return localStorage.getItem(this.KEYS.CURRENT_PLAN) || 'nt90';
    },

    // Set current reading plan
    setCurrentPlan(plan) {
        localStorage.setItem(this.KEYS.CURRENT_PLAN, plan);
    },

    // Get calendar type
    getCalendarType() {
        return localStorage.getItem(this.KEYS.CALENDAR_TYPE) || 'gregorian';
    },

    // Set calendar type
    setCalendarType(type) {
        localStorage.setItem(this.KEYS.CALENDAR_TYPE, type);
    },

    // Get start date for a plan
    getStartDate(planType = null) {
        if (!planType) {
            planType = this.getCurrentPlan();
        }
        
        const keyMap = {
            'nt90': this.KEYS.START_DATE_NT90,
            'ot365': this.KEYS.START_DATE_OT365,
            'ethiopian': this.KEYS.START_DATE_ETHIOPIAN
        };
        
        const key = keyMap[planType];
        if (!key) return null;
        
        const dateStr = localStorage.getItem(key);
        return dateStr ? new Date(dateStr) : null;
    },

    // Set start date for a plan
    setStartDate(planType, date) {
        const keyMap = {
            'nt90': this.KEYS.START_DATE_NT90,
            'ot365': this.KEYS.START_DATE_OT365,
            'ethiopian': this.KEYS.START_DATE_ETHIOPIAN
        };
        
        const key = keyMap[planType];
        if (!key) return false;
        
        try {
            localStorage.setItem(key, date.toISOString());
            return true;
        } catch (error) {
            console.error('Error saving start date:', error);
            return false;
        }
    },

    // Update streak
    updateStreak(dateStr) {
        try {
            const streakData = this.getStreakData();
            const today = new Date();
            const todayStr = this.formatDate(today);
            
            if (dateStr === todayStr) {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = this.formatDate(yesterday);
                
                if (streakData.lastDate === yesterdayStr || !streakData.lastDate) {
                    streakData.currentStreak++;
                } else if (streakData.lastDate !== todayStr) {
                    streakData.currentStreak = 1;
                }
                
                streakData.lastDate = todayStr;
                streakData.longestStreak = Math.max(streakData.currentStreak, streakData.longestStreak);
                
                this.saveStreakData(streakData);
            }
        } catch (error) {
            console.error('Error updating streak:', error);
        }
    },

    // Get streak data
    getStreakData() {
        try {
            const data = localStorage.getItem(this.KEYS.STREAK_DATA);
            return data ? JSON.parse(data) : {
                currentStreak: 0,
                longestStreak: 0,
                lastDate: null
            };
        } catch (error) {
            console.error('Error loading streak data:', error);
            return { currentStreak: 0, longestStreak: 0, lastDate: null };
        }
    },

    // Save streak data
    saveStreakData(data) {
        try {
            localStorage.setItem(this.KEYS.STREAK_DATA, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving streak data:', error);
        }
    },

    // Reset all data
    resetAll() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            window.location.reload();
        }
    },

    // Format date as YYYY-MM-DD
    formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // Get statistics
    getStatistics() {
        const completed = this.getCompletedReadings();
        const streakData = this.getStreakData();
        
        return {
            totalCompleted: completed.length,
            currentStreak: streakData.currentStreak,
            longestStreak: streakData.longestStreak
        };
    }
};

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.StorageManager = StorageManager;
}
[file content end]