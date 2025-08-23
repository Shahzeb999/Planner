# LLM Prep Planner - 6-Month Preparation Journey

A comprehensive **local-first web application** for managing your LLM/ML preparation plan from Excel workbooks and Markdown playbooks. Built with Next.js, TypeScript, SQLite, and shadcn/ui.

![LLM Prep Planner](https://img.shields.io/badge/Status-Complete-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![SQLite](https://img.shields.io/badge/SQLite-Local-green)

## ✨ Features

### 📅 **Today Dashboard**
- View today's plan items with session timer
- Quick actions: start/stop sessions, mark status, open resources
- Jump to playbooks directly from resource pointers
- Progress tracking and time management

### 🗓️ **Interactive Calendar**
- Month/week views with drag-and-drop functionality
- Color-coded tasks by type with status indicators
- Weekly challenge badges and mock interview scheduling
- Click dates to view detailed task breakdown

### 💻 **Problem Tracking**
- Separate tabs for Weekly Problem Sets and OOP Problem Sets
- Advanced filtering by week, topic/track, difficulty, and status
- Inline actions: mark solved, log time, open URLs
- Comprehensive progress counters and statistics

### 📚 **Playbooks & Resources**
- Markdown rendering with GitHub-style formatting
- Interactive checklists extracted from playbook content
- "Copy repo structure" and export functionality
- Resources grouped by week/area with pinning support

### 🎯 **Mock Interview Management**
- Schedule, track, and review mock interview performance
- Outcome recording with 1-5 star ratings and detailed feedback
- Auto-generated debrief templates with STAR methodology
- Performance trends and improvement tracking

### 📊 **Analytics Dashboard**
- Interactive charts using recharts for progress visualization
- Weekly completion trends, problem difficulty analysis
- Mock interview performance tracking over time
- Time investment analysis by category and knowledge gap identification

### 🔍 **Global Search**
- Fuzzy search across all content types
- Intelligent ranking with relevance scores
- Advanced filtering and sorting options
- Highlighted search matches with context

### ⚙️ **Settings & Customization**
- Timezone configuration (default: Asia/Kolkata IST)
- Theme selection (light/dark/system)
- Notification preferences and keyboard shortcuts
- Data export/import and backup functionality

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm/yarn
- Your `full_fledged_plan_v2.xlsx` file
- Markdown playbooks in `playbooks/` folder

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd llm-prep-app
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

2. **Set up your data files:**
   ```bash
   # Place your Excel file in the parent directory
   cp path/to/your/full_fledged_plan_v2.xlsx ../

   # Ensure playbooks are in public/playbooks/ (already copied)
   ls public/playbooks/
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

5. **Import your data:**
   - Go to the Import page
   - Click "Import Default File" to use the Excel file from parent directory
   - Or upload your Excel file manually
   - Wait for the import to complete

## 📋 Excel File Requirements

Your Excel workbook should contain these sheets with the specified columns:

### **Plan Sheet**
- `Date` - Task date (any recognizable format)
- `Week` - Week number (optional, auto-calculated)
- `Week Range` - Week date range (optional)
- `Day` - Day name (optional, auto-calculated)
- `Phase` - Preparation phase (optional)
- `Theme (Week Focus)` - Main theme/focus area
- `Task Type` - Type of task (Study, Practice, Project, etc.)
- `Task Description` - Detailed description
- `Weekly Challenge (Sat)` - Saturday challenge (optional)
- `Resource Pointer` - Link to resources/playbooks

### **Weekly Problem Sets**
- `Week` - Week number
- `Topic` - Problem category/topic
- `Problem` - Problem name
- `Difficulty` - Easy, Medium, or Hard
- `URL` - Problem link (optional)
- `Notes` - Additional notes (optional)

### **OOP Problem Sets**
- `Week` - Week number
- `Track` - Problem track (e.g., Design Patterns)
- `Problem` - Problem name
- `Difficulty` - Easy, Medium, or Hard
- `URL` - Problem link (optional)
- `Notes` - Additional notes (optional)

### **Projects & Resources**
- `Week` - Week number
- `Area` - Resource area/category
- `Resource` - Resource title
- `URL` - Resource link (optional)
- `Notes` - Additional notes (optional)

### **Mocks & Checklists**
- `Week` - Week number
- `Mock Type` - Type of mock interview
- `Goal` - Interview goal/focus
- `Notes` - Additional notes (optional)

## 🎯 Usage Guide

### **First-Time Setup**
1. **Import Data**: Use the Import page to load your Excel file
2. **Verify Import**: Check the import summary for any errors
3. **Explore**: Navigate to Today page to see your current tasks
4. **Customize**: Visit Settings to configure timezone and preferences

### **Daily Workflow**
1. **Start with Today**: Review today's plan items and start sessions
2. **Use Timer**: Track time spent on tasks with the session timer
3. **Update Status**: Mark tasks as in-progress or completed
4. **Check Playbooks**: Open relevant playbooks for guidance
5. **Log Progress**: Add notes and feedback for future reference

### **Weekly Review**
1. **Calendar View**: Review the week's progress and upcoming tasks
2. **Analytics**: Check your completion trends and time investment
3. **Problems**: Review solved problems and plan next week's practice
4. **Mocks**: Schedule upcoming mock interviews and review feedback

### **Data Management**
- **Export**: Use Settings → Data Management to backup your data
- **Import**: Restore from backup or import updated Excel files
- **Search**: Use global search (/) to find specific content quickly

## 🔧 Technical Architecture

### **Stack**
- **Frontend**: Next.js 15 + TypeScript + App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: SQLite with Drizzle ORM
- **Data Processing**: xlsx for Excel parsing
- **Markdown**: react-markdown for playbook rendering
- **Charts**: recharts for analytics visualization
- **Icons**: lucide-react
- **Date Handling**: date-fns with IST timezone support

### **Database Schema**
- `plan_items` - Daily tasks and activities
- `problems` - Weekly coding problems
- `oop_problems` - OOP exercise tracking
- `resources` - Learning resources and references
- `mocks` - Mock interview scheduling and feedback
- `sessions` - Time tracking and study sessions
- `settings` - User preferences and configuration
- `playbook_checklists` - Playbook progress tracking

### **Key Features**
- **Local-First**: All data stored locally in SQLite
- **Real-Time**: Instant updates with optimistic UI
- **Responsive**: Desktop-optimized with mobile support
- **Accessible**: Keyboard shortcuts and screen reader support
- **Type-Safe**: Full TypeScript coverage with strict types

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `t` | Go to Today |
| `c` | Go to Calendar |
| `p` | Go to Problems |
| `r` | Go to Playbooks |
| `m` | Go to Mocks |
| `a` | Go to Analytics |
| `i` | Go to Import |
| `/` | Focus Search |
| `s` | Go to Settings |

## 🎨 Customization

### **Themes**
- Light mode (default)
- Dark mode
- System preference following

### **Timezone**
- Default: Asia/Kolkata (IST)
- Supports major timezones worldwide
- Real-time clock display

### **Notifications**
- Daily task reminders
- Weekly review prompts
- Mock interview alerts
- Deadline notifications

## 🚨 Troubleshooting

### **Import Issues**
- **Excel not found**: Ensure `full_fledged_plan_v2.xlsx` is in parent directory
- **Column errors**: Verify sheet names and column headers match requirements
- **Date parsing**: Use standard date formats (YYYY-MM-DD recommended)

### **Performance**
- **Large datasets**: Use filters to limit displayed data
- **Slow searches**: Try more specific search terms
- **Memory usage**: Restart the app if experiencing slowdowns

### **Data Issues**
- **Missing data**: Check import logs for errors
- **Corrupted database**: Use Settings → Reset to restore defaults
- **Backup recovery**: Import from previously exported backup files

## 🔄 Data Migration

### **From Excel Updates**
1. Update your Excel file with new data
2. Go to Import page
3. Click "Import Default File" or upload manually
4. Review the upsert summary (existing data preserved)
5. Verify changes in respective pages

### **Backup & Restore**
1. **Export**: Settings → Data Management → Export Data
2. **Import**: Settings → Data Management → Import Data
3. Files are JSON format with metadata and settings

## 🎯 Assumptions & Defaults

- **Timezone**: Defaults to Asia/Kolkata (IST) for Indian users
- **Week Start**: Saturday (configurable in Settings)
- **Date Format**: ISO format (YYYY-MM-DD) preferred
- **Difficulty Levels**: Exactly "Easy", "Medium", "Hard"
- **Status Values**: "todo", "in_progress", "done" for plan items
- **Problem Status**: "todo", "solved", "skipped"

## 🐛 Known Limitations

- **Offline Support**: Requires internet for initial setup and playbook loading
- **Concurrent Access**: Single-user application (no multi-user support)
- **Excel Formats**: Supports .xlsx and .xls (not CSV or Google Sheets directly)
- **Playbook Format**: Supports Markdown only (not PDF or Word docs)

## 🚀 Future Enhancements

- [ ] Cloud sync and backup options
- [ ] Mobile app version
- [ ] Collaborative features
- [ ] Advanced analytics and AI insights
- [ ] Integration with external calendars
- [ ] Plugin system for extensions

## 📝 License

This project is built for personal LLM/ML preparation. Feel free to adapt and modify for your own learning journey.

## 🤝 Contributing

This is a personal preparation tool, but suggestions and improvements are welcome! Feel free to:
- Report bugs or issues
- Suggest feature enhancements
- Share your adaptation ideas

---

**Happy Learning! 🚀📚**

Built with ❤️ for the LLM/ML learning community.