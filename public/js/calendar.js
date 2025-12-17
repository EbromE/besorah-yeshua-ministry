[file name]: public/js/calendar.js
[file content begin]
// Calendar Manager for Bible Planner
// Handles calendar rendering and date selection

const CalendarManager = {
    currentDate: new Date(),
    selectedDate: new Date(),
    calendarType: 'gregorian',

    // Initialize calendar
    init() {
        this.calendarType = StorageManager.getCalendarType();
        this.setupEventListeners();
        this.render();
    },

    // Setup event listeners
    setupEventListeners() {
        // Month navigation
        const prevBtn = document.getElementById('prevMonth');
        const nextBtn = document.getElementById('nextMonth');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousMonth());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextMonth());
        }

        // Calendar type toggle
        const gregorianBtn = document.getElementById('gregorianBtn');
        const ethiopianBtn = document.getElementById('ethiopianBtn');
        
        if (gregorianBtn) {
            gregorianBtn.addEventListener('click', () => this.switchCalendar('gregorian'));
        }
        
        if (ethiopianBtn) {
            ethiopianBtn.addEventListener('click', () => this.switchCalendar('ethiopian'));
        }
    },

    // Switch calendar type
    switchCalendar(type) {
        this.calendarType = type;
        StorageManager.setCalendarType(type);
        
        // Update button states
        document.getElementById('gregorianBtn')?.classList.toggle('active', type === 'gregorian');
        document.getElementById('ethiopianBtn')?.classList.toggle('active', type === 'ethiopian');
        
        this.render();
        this.selectDate(this.selectedDate);
    },

    // Render calendar
    render() {
        this.renderMonthHeader();
        this.renderCalendarGrid();
    },

    // Render month header
    renderMonthHeader() {
        const monthHeader = document.getElementById('currentMonth');
        if (!monthHeader) return;

        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const ethiopianMonths = [
            'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
            'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'
        ];

        if (this.calendarType === 'gregorian') {
            const month = months[this.currentDate.getMonth()];
            const year = this.currentDate.getFullYear();
            monthHeader.textContent = `${month} ${year}`;
        } else {
            // Ethiopian calendar (simplified - would need proper conversion)
            const ethMonth = ethiopianMonths[this.currentDate.getMonth() % 13];
            const ethYear = this.currentDate.getFullYear() - 7;
            monthHeader.textContent = `${ethMonth} ${ethYear}`;
        }
    },

    // Render calendar grid
    renderCalendarGrid() {
        const calendar = document.getElementById('calendar');
        if (!calendar) return;

        calendar.innerHTML = '';

        // Add day headers
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            const header = document.createElement('div');
            header.className = 'day-header';
            header.textContent = day;
            calendar.appendChild(header);
        });

        // Get calendar data
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const cell = this.createDayCell(day, 'other-month');
            calendar.appendChild(cell);
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const cell = this.createDayCell(day, '', date);
            calendar.appendChild(cell);
        }

        // Next month days
        const remainingCells = 42 - (firstDay + daysInMonth);
        for (let day = 1; day <= remainingCells; day++) {
            const cell = this.createDayCell(day, 'other-month');
            calendar.appendChild(cell);
        }
    },

    // Create day cell
    createDayCell(day, extraClass = '', date = null) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        
        if (extraClass) {
            cell.classList.add(extraClass);
        }

        const dayNumber = document.createElement('div');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = day;
        cell.appendChild(dayNumber);

        if (date) {
            // Check if today
            const today = new Date();
            if (this.isSameDay(date, today)) {
                cell.classList.add('today');
            }

            // Check if selected
            if (this.isSameDay(date, this.selectedDate)) {
                cell.classList.add('selected');
            }

            // Check if completed
            if (StorageManager.isComplete(date)) {
                cell.classList.add('completed');
            }

            // Add click event
            cell.addEventListener('click', () => this.selectDate(date));
            cell.dataset.date = StorageManager.formatDate(date);
        }

        return cell;
    },

    // Select date
    selectDate(date) {
        this.selectedDate = date;
        this.showReadingForDate(date);
        
        // Update visual selection
        document.querySelectorAll('.calendar-day').forEach(cell => {
            cell.classList.remove('selected');
        });
        
        const dateStr = StorageManager.formatDate(date);
        const selectedCell = document.querySelector(`[data-date="${dateStr}"]`);
        if (selectedCell) {
            selectedCell.classList.add('selected');
        }
    },

    // Show reading for date
    showReadingForDate(date) {
        const container = document.getElementById('todayReading');
        const dayElement = document.getElementById('currentDay');
        const themeElement = document.getElementById('currentTheme');
        const checkbox = document.getElementById('markComplete');
        
        if (!container) return;

        const plan = StorageManager.getCurrentPlan();
        const reading = ReadingPlans.getReadingForDate(date, plan);

        if (reading) {
            // Update day and theme
            if (dayElement) {
                dayElement.textContent = `Day ${reading.day}`;
            }
            if (themeElement) {
                themeElement.textContent = reading.theme || '';
            }
            
            // Update reading content
            container.innerHTML = `
                <div class="reading-item">
                    <div class="reading-title">${reading.title}</div>
                    <div class="reading-passages">${reading.passages.join(', ')}</div>
                    ${reading.chapters ? `<p>📖 ${reading.chapters} chapter${reading.chapters > 1 ? 's' : ''}</p>` : ''}
                    ${reading.month ? `<p>📅 ${reading.month}</p>` : ''}
                    ${reading.focus ? `<p>🎯 ${reading.focus}</p>` : ''}
                    ${reading.feast ? `<p>🎉 ${reading.feast}</p>` : ''}
                </div>
            `;
        } else {
            container.innerHTML = '<p class="reading-placeholder">No reading scheduled for this date</p>';
            if (dayElement) dayElement.textContent = 'No Reading';
            if (themeElement) themeElement.textContent = '';
        }

        // Update checkbox
        if (checkbox) {
            checkbox.checked = StorageManager.isComplete(date);
        }

        // Load notes for this date
        const notesTextarea = document.getElementById('studyNotes');
        if (notesTextarea) {
            notesTextarea.value = StorageManager.getStudyNotes(date);
        }
        
        // Update plan stats display
        this.updatePlanStats(plan);
    },
    
    // Update plan statistics display
    updatePlanStats(plan) {
        const planInfo = ReadingPlans.getPlanInfo(plan);
        const description = document.getElementById('planDescription');
        const chapters = document.getElementById('planChapters');
        const time = document.getElementById('planTime');
        const days = document.getElementById('planDays');
        
        if (description) {
            description.textContent = planInfo.description;
        }
        if (chapters) {
            chapters.textContent = planInfo.totalChapters || 'N/A';
        }
        if (time) {
            time.textContent = ReadingPlans.getSuggestedTime(plan);
        }
        if (days) {
            days.textContent = planInfo.days;
        }
    },

    // Previous month
    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
    },

    // Next month
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
    },

    // Check if same day
    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }
};

// Update statistics function
function updateStatistics() {
    const stats = StorageManager.getStatistics();
    const plan = StorageManager.getCurrentPlan();
    const planInfo = ReadingPlans.getPlanInfo(plan);
    
    // Get total readings based on plan
    const totalReadings = planInfo.days || 90;
    
    // Update DOM
    const totalEl = document.getElementById('totalReading');
    const completedEl = document.getElementById('completedReading');
    const progressEl = document.getElementById('progressPercent');
    const streakEl = document.getElementById('streakDays');
    
    if (totalEl) totalEl.textContent = totalReadings;
    if (completedEl) completedEl.textContent = stats.totalCompleted;
    if (progressEl) {
        const percent = Math.round((stats.totalCompleted / totalReadings) * 100);
        progressEl.textContent = `${percent}%`;
    }
    if (streakEl) streakEl.textContent = stats.currentStreak;
}

// Export for use
if (typeof window !== 'undefined') {
    window.CalendarManager = CalendarManager;
    window.updateStatistics = updateStatistics;
}