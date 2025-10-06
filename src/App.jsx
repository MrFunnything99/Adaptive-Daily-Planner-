import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, Plus, Trash2, Edit2, Save, X, Sparkles, Download, Upload, RefreshCw } from 'lucide-react';
// @ts-nocheck

const DailyAdaptivePlanner = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentDate] = useState(new Date());
  const [planningWindow, setPlanningWindow] = useState({ start: '08:00', end: '18:00' });
  const [transitionTime, setTransitionTime] = useState(15);
  const [blockedTimes, setBlockedTimes] = useState([]);
  
  const [recurringHabits, setRecurringHabits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [todos, setTodos] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [todayCompleted, setTodayCompleted] = useState([]);
  
  const [activeTab, setActiveTab] = useState('today');
  const [showSmartImport, setShowSmartImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStep, setImportStep] = useState(1);
  
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [showBlockedTimeForm, setShowBlockedTimeForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editingHabit, setEditingHabit] = useState(null);
  
  const [newTodo, setNewTodo] = useState({ name: '', timeEstimateMinutes: 30, priority: 1, dueDate: '' });
  const [newProject, setNewProject] = useState({ name: '', totalHoursNeeded: 0, dueDate: '', priority: 1, hoursCompleted: 0, startDate: '' });
  const [newHabit, setNewHabit] = useState({ name: '', durationMinutes: 60, frequencyPerWeek: 7, priority: 1 });
  const [newBlockedTime, setNewBlockedTime] = useState({ start: '12:00', end: '13:00', label: 'Lunch' });

  // Load Google Font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const [promptTemplate] = useState(`You are helping me organize my goals using a daily planner app. Please have a conversation with me to understand my goals, then format them as JSON.

**YOUR JOB:**
1. First, briefly explain the three categories (To-Dos, Projects, Habits) to me
2. Ask me about each category ONE AT A TIME - wait for my response before moving to the next
3. Ask clarifying questions if needed (priorities, deadlines, time estimates)
4. At the end, provide the formatted JSON for me to paste into my planner

**ABOUT THE PLANNER:**

📋 **To-Dos** - One-time tasks with specific deadlines
- Single actions you complete once (like "call dentist" or "submit report")
- Need: time estimate in minutes, priority, optional due date
- Once done, they're checked off permanently

🎯 **Projects** - Larger goals requiring multiple work sessions
- Bigger undertakings needing ongoing time investment (like "learn Spanish" or "build a website")
- Need: total hours needed, hours already completed, priority, optional start/due dates
- You work on them in chunks over time until finished

🔄 **Habits** - Recurring activities you want to do regularly
- Routines you want to build (like "exercise", "read", or "meditate")
- Need: session duration in minutes, times per week, priority
- Tracks weekly progress and resets each week

**PRIORITY SYSTEM:**
- Priority 1 = Urgent (due very soon or critical)
- Priority 2 = Important (matters but not time-sensitive)
- Priority 3 = Medium (nice to do when you have time)
- Priority 4 = Low (eventual goals, not pressing)

**YOUR CONVERSATION FLOW:**
1. Explain the three categories briefly
2. Ask: "What TO-DOs do you have? These are one-time tasks you need to complete."
3. Wait for response, ask follow-ups about deadlines/priority if needed
4. Ask: "What PROJECTS are you working on? These are bigger goals that need multiple sessions."
5. Wait for response, ask about time estimates and deadlines
6. Ask: "What HABITS do you want to build? These are routines you'll do regularly."
7. Wait for response, ask about frequency and duration
8. Provide the final JSON in this exact format:

{
  "todos": [
    {"name": "task name", "timeEstimateMinutes": 30, "priority": 1, "dueDate": "2025-10-15"}
  ],
  "projects": [
    {"name": "project name", "totalHoursNeeded": 20, "dueDate": "2025-12-01", "priority": 1, "hoursCompleted": 0, "startDate": "2025-10-05"}
  ],
  "habits": [
    {"name": "habit name", "durationMinutes": 30, "frequencyPerWeek": 5, "priority": 1}
  ]
}

**FORMATTING RULES FOR THE FINAL JSON:**
- All dates must be YYYY-MM-DD format
- Time estimates in minutes (not hours)
- If no due date mentioned, use empty string ""
- If no start date mentioned, use empty string ""
- Today's date is ${currentDate.toISOString().split('T')[0]}

**IMPORTANT:** Have a natural conversation with me first, asking about each category separately. Only provide the JSON at the very end after you've gathered all the information. Start by explaining the categories and asking about my to-dos!`);

  // Load data once on mount
  useEffect(() => {
    const savedData = localStorage.getItem('planner-data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        console.log('Loading saved data:', data);
        if (data.habits) setRecurringHabits(data.habits);
        if (data.projects) setProjects(data.projects);
        if (data.todos) setTodos(data.todos);
        if (data.completedProjects) setCompletedProjects(data.completedProjects);
        if (data.todayCompleted) setTodayCompleted(data.todayCompleted);
        if (data.transitionTime !== undefined) setTransitionTime(data.transitionTime);
        if (data.planningWindow) setPlanningWindow(data.planningWindow);
        if (data.blockedTimes) setBlockedTimes(data.blockedTimes);
      } catch (error) {
        console.error('Load failed:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save data when it changes (but only after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    
    const data = {
      habits: recurringHabits,
      projects: projects,
      todos: todos,
      completedProjects: completedProjects,
      todayCompleted: todayCompleted,
      transitionTime: transitionTime,
      planningWindow: planningWindow,
      blockedTimes: blockedTimes,
    };
    console.log('Saving data:', data);
    localStorage.setItem('planner-data', JSON.stringify(data));
  }, [isLoaded, recurringHabits, projects, todos, completedProjects, todayCompleted, transitionTime, planningWindow, blockedTimes]);

  const timeToMinutes = (timeStr) => {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes) => {
    const adjustedMinutes = minutes % 1440;
    const hours = Math.floor(adjustedMinutes / 60);
    const mins = adjustedMinutes % 60;
    const hourStr = hours.toString().padStart(2, '0');
    const minStr = mins.toString().padStart(2, '0');
    return hourStr + ':' + minStr;
  };

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(promptTemplate);
    alert('Prompt copied! Paste it into ChatGPT, Claude, or any LLM.');
  };

  const addBlockedTime = () => {
    if (newBlockedTime.start && newBlockedTime.end) {
      const blocked = { ...newBlockedTime, id: Date.now() };
      setBlockedTimes([...blockedTimes, blocked]);
      setNewBlockedTime({ start: '12:00', end: '13:00', label: 'Lunch' });
      setShowBlockedTimeForm(false);
    }
  };

  const deleteBlockedTime = (id) => {
    setBlockedTimes(blockedTimes.filter(b => b.id !== id));
  };

  const addTodo = () => {
    if (newTodo.name) {
      const todo = { ...newTodo, id: Date.now(), status: 'pending' };
      setTodos([...todos, todo]);
      setNewTodo({ name: '', timeEstimateMinutes: 30, priority: 1, dueDate: '' });
      setShowTodoForm(false);
    }
  };

  const addProject = () => {
    if (newProject.name && newProject.totalHoursNeeded > 0) {
      const project = { ...newProject, id: Date.now() };
      setProjects([...projects, project]);
      setNewProject({ name: '', totalHoursNeeded: 0, dueDate: '', priority: 1, hoursCompleted: 0, startDate: '' });
      setShowProjectForm(false);
    }
  };

  const addHabit = () => {
    if (newHabit.name) {
      const habit = { ...newHabit, id: Date.now(), weeklyCompleted: 0, totalHoursLogged: 0 };
      setRecurringHabits([...recurringHabits, habit]);
      setNewHabit({ name: '', durationMinutes: 60, frequencyPerWeek: 7, priority: 1 });
      setShowHabitForm(false);
    }
  };

  const updateTodo = (id, field, value) => {
    const updated = todos.map(t => {
      if (t.id === id) {
        const updatedTodo = { ...t };
        updatedTodo[field] = value;
        return updatedTodo;
      }
      return t;
    });
    setTodos(updated);
  };

  const updateProject = (id, field, value) => {
    const updated = projects.map(p => {
      if (p.id === id) {
        const updatedProject = { ...p };
        updatedProject[field] = value;
        return updatedProject;
      }
      return p;
    });
    setProjects(updated);
  };

  const updateHabit = (id, field, value) => {
    const updated = recurringHabits.map(h => {
      if (h.id === id) {
        const updatedHabit = { ...h };
        updatedHabit[field] = value;
        return updatedHabit;
      }
      return h;
    });
    setRecurringHabits(updated);
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const deleteProject = (id) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const deleteHabit = (id) => {
    setRecurringHabits(recurringHabits.filter(h => h.id !== id));
  };

  const completeProject = (project) => {
    const completed = {
      ...project,
      completionDate: currentDate.toISOString().split('T')[0]
    };
    setCompletedProjects([...completedProjects, completed]);
    deleteProject(project.id);
  };

  const exportData = () => {
    const data = {
      habits: recurringHabits,
      projects: projects,
      todos: todos,
      completedProjects: completedProjects,
      transitionTime: transitionTime,
      planningWindow: planningWindow,
      blockedTimes: blockedTimes,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'planner-backup-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.habits) setRecurringHabits(data.habits);
        if (data.projects) setProjects(data.projects);
        if (data.todos) setTodos(data.todos);
        if (data.completedProjects) setCompletedProjects(data.completedProjects);
        if (data.transitionTime !== undefined) setTransitionTime(data.transitionTime);
        if (data.planningWindow) setPlanningWindow(data.planningWindow);
        if (data.blockedTimes) setBlockedTimes(data.blockedTimes);
        alert('Data imported successfully!');
      } catch (error) {
        alert('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
      setRecurringHabits([]);
      setProjects([]);
      setTodos([]);
      setCompletedProjects([]);
      setTodayCompleted([]);
      setTransitionTime(15);
      setPlanningWindow({ start: '08:00', end: '18:00' });
      setBlockedTimes([]);
      alert('All data cleared!');
    }
  };

  const handleSmartImport = () => {
    setIsImporting(true);
    
    try {
      let responseText = importText.trim();
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(responseText);
      
      if (parsed.todos) {
        const newTodos = parsed.todos.map(t => {
          return { ...t, id: Date.now() + Math.random(), status: 'pending' };
        });
        setTodos([...todos, ...newTodos]);
      }
      if (parsed.projects) {
        const newProjects = parsed.projects.map(p => {
          return { ...p, id: Date.now() + Math.random() };
        });
        setProjects([...projects, ...newProjects]);
      }
      if (parsed.habits) {
        const newHabits = parsed.habits.map(h => {
          return { ...h, id: Date.now() + Math.random(), weeklyCompleted: 0, totalHoursLogged: 0 };
        });
        setRecurringHabits([...recurringHabits, ...newHabits]);
      }
      
      setImportText('');
      setShowSmartImport(false);
      setImportStep(1);
      alert('Import successful!');
    } catch (error) {
      alert('Import failed. Make sure you pasted valid JSON from the LLM.');
    } finally {
      setIsImporting(false);
    }
  };

  const isTimeBlocked = (minutes) => {
    const normalizedMinutes = minutes % 1440;
    
    for (const blocked of blockedTimes) {
      const blockedStart = timeToMinutes(blocked.start);
      const blockedEnd = timeToMinutes(blocked.end);
      
      if (blockedEnd < blockedStart) {
        if (normalizedMinutes >= blockedStart || normalizedMinutes < blockedEnd) {
          return true;
        }
      } else {
        if (normalizedMinutes >= blockedStart && normalizedMinutes < blockedEnd) {
          return true;
        }
      }
    }
    return false;
  };

  const getNextAvailableTime = (currentMinutes) => {
    let nextTime = currentMinutes;
    
    let wasBlocked = true;
    while (wasBlocked) {
      wasBlocked = false;
      const normalizedTime = nextTime % 1440;
      
      for (const blocked of blockedTimes) {
        const blockedStart = timeToMinutes(blocked.start);
        const blockedEnd = timeToMinutes(blocked.end);
        
        if (blockedEnd < blockedStart) {
          if (normalizedTime >= blockedStart || normalizedTime < blockedEnd) {
            if (normalizedTime >= blockedStart) {
              nextTime = nextTime - normalizedTime + blockedEnd + 1440;
            } else {
              nextTime = nextTime - normalizedTime + blockedEnd;
            }
            wasBlocked = true;
            break;
          }
        } else {
          if (normalizedTime >= blockedStart && normalizedTime < blockedEnd) {
            nextTime = nextTime - normalizedTime + blockedEnd;
            wasBlocked = true;
            break;
          }
        }
      }
    }
    
    return nextTime;
  };

const generateDailyPlan = () => {
  console.log('=== GENERATING PLAN ===');
  console.log('Habits:', recurringHabits);
  console.log('Projects:', projects);
  console.log('Todos:', todos);
  console.log('Planning window:', planningWindow);

  const plan = [];
  let startMinutes = timeToMinutes(planningWindow.start);
  let endMinutes = timeToMinutes(planningWindow.end);
  
  if (endMinutes <= startMinutes) {
    endMinutes += 1440;
  }
  
  console.log('Start minutes:', startMinutes, 'End minutes:', endMinutes);
  
  const daysLeft = Math.max(1, 7 - currentDate.getDay());
  console.log('Days left in week:', daysLeft);
  
  let currentTime = startMinutes;
  const planEndTime = endMinutes;

  const items = [];

  // Check habits
  recurringHabits.forEach(habit => {
    console.log('Checking habit:', habit.name);
    console.log('  Weekly completed:', habit.weeklyCompleted, 'Frequency:', habit.frequencyPerWeek);
    const remaining = habit.frequencyPerWeek - habit.weeklyCompleted;
    console.log('  Remaining sessions:', remaining);
    
    if (remaining > 0) {
      const sessionsPerDay = remaining / daysLeft;
      const sessionsToday = Math.ceil(sessionsPerDay);
      console.log('  Sessions today:', sessionsToday);
      
      let urgency = 'normal';
      if (sessionsPerDay >= 2) urgency = 'critical';
      else if (sessionsPerDay > 1.2) urgency = 'high';
      
      for (let i = 0; i < sessionsToday; i++) {
        items.push({
          id: 'habit-' + habit.id + '-' + i,
          name: habit.name,
          duration: habit.durationMinutes,
          priority: habit.priority,
          urgency: urgency,
          type: 'habit',
          itemId: habit.id
        });
      }
    }
  });

  console.log('Items after habits:', items.length);

  console.log('Total items before scheduling:', items.length);
  console.log('Items:', items);

  const urgencyWeight = { critical: 0, high: 1, normal: 2 };
  items.sort((a, b) => {
    const urgDiff = urgencyWeight[a.urgency] - urgencyWeight[b.urgency];
    if (urgDiff !== 0) return urgDiff;
    return a.priority - b.priority;
  });

  for (const item of items) {
    currentTime = getNextAvailableTime(currentTime);
    
    console.log('Trying to schedule:', item.name, 'at', currentTime, 'duration:', item.duration);
    console.log('  Will end at:', currentTime + item.duration, 'Plan ends at:', planEndTime);
    
    if (currentTime + item.duration <= planEndTime) {
      let taskFits = true;
      for (let t = currentTime; t < currentTime + item.duration; t += 15) {
        if (isTimeBlocked(t)) {
          taskFits = false;
          break;
        }
      }
      
      if (taskFits) {
        console.log('  ✓ Scheduled!');
        plan.push({
          ...item,
          startTime: minutesToTime(currentTime),
          endTime: minutesToTime(currentTime + item.duration)
        });
        currentTime += item.duration + transitionTime;
      } else {
        console.log('  ✗ Time blocked');
        currentTime = getNextAvailableTime(currentTime + item.duration);
      }
    } else {
      console.log('  ✗ Not enough time (would extend past', minutesToTime(planEndTime), ')');
      break;
    }
  }

  console.log('Final plan items:', plan.length);
  return plan;
};

  const markComplete = (planItem) => {
    setTodayCompleted([...todayCompleted, planItem.id]);
    
    if (planItem.type === 'habit') {
      const updated = recurringHabits.map(h => {
        if (h.id === planItem.itemId) {
          return {
            ...h,
            weeklyCompleted: h.weeklyCompleted + 1,
            totalHoursLogged: h.totalHoursLogged + (planItem.duration / 60)
          };
        }
        return h;
      });
      setRecurringHabits(updated);
    } else if (planItem.type === 'project') {
      const updated = projects.map(p => {
        if (p.id === planItem.itemId) {
          return {
            ...p,
            hoursCompleted: p.hoursCompleted + (planItem.duration / 60)
          };
        }
        return p;
      });
      setProjects(updated);
    } else if (planItem.type === 'todo') {
      const updated = todos.map(t => {
        if (t.id === planItem.itemId) {
          return { ...t, status: 'completed' };
        }
        return t;
      });
      setTodos(updated);
    }
  };

  const plan = generateDailyPlan();
  
  let availableMinutes = timeToMinutes(planningWindow.end) - timeToMinutes(planningWindow.start);
  if (availableMinutes < 0) {
    availableMinutes += 1440;
  }
  availableMinutes = Math.max(0, availableMinutes);

  const getUrgencyColor = (urgency) => {
    if (urgency === 'critical') return 'bg-red-50 border-red-300';
    if (urgency === 'high') return 'bg-orange-50 border-orange-300';
    return 'bg-blue-50 border-blue-300';
  };

  const getPriorityColor = (priority) => {
    if (priority === 1) return 'bg-red-100 text-red-700';
    if (priority === 2) return 'bg-orange-100 text-orange-700';
    if (priority === 3) return 'bg-yellow-100 text-yellow-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <div className="mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 via-red-500 via-orange-500 via-yellow-500 via-green-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent mb-2">
          Adaptive Daily Planner
        </h1>
        <p className="text-slate-600">Smart scheduling that adapts to your life</p>
      </div>

      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-10 gap-4 items-start">
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Today</label>
              <div className="text-lg font-bold text-slate-800">
                {currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
            <div className="md:col-span-4">
              <label className="block text-xs font-medium text-slate-600 mb-1">Plan my day from</label>
              <div className="flex gap-2 items-center">
                <input
                  type="time"
                  value={planningWindow.start}
                  onChange={(e) => setPlanningWindow({...planningWindow, start: e.target.value})}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                />
                <span className="text-slate-600 font-medium">to</span>
                <input
                  type="time"
                  value={planningWindow.end}
                  onChange={(e) => setPlanningWindow({...planningWindow, end: e.target.value})}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">When are you available to work on your goals?</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Transition Time</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={transitionTime}
                  onChange={(e) => setTransitionTime(parseInt(e.target.value) || 0)}
                  className="w-16 px-3 py-2 border border-slate-300 rounded-lg"
                />
                <span className="text-sm text-slate-600">min</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Buffer between tasks</p>
            </div>
            <div className="md:col-span-3">
              <div className="flex items-center justify-between mb-1 gap-2">
                <label className="block text-xs font-medium text-slate-600 whitespace-nowrap">Time Blocks</label>
                <button
                  onClick={() => setShowBlockedTimeForm(true)}
                  className="flex items-center gap-1 px-2 py-1 bg-slate-600 text-white rounded text-xs hover:bg-slate-700 flex-shrink-0"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>
              {blockedTimes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {blockedTimes.map(blocked => (
                    <div key={blocked.id} className="flex items-center gap-1 px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs">
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span className="font-medium">{blocked.label}</span>
                      <span className="text-slate-600">{blocked.start}-{blocked.end}</span>
                      <button
                        onClick={() => deleteBlockedTime(blocked.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No time blocks set</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowTodoForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            To-Do
          </button>
          <button
            onClick={() => setShowProjectForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Project
          </button>
          <button
            onClick={() => setShowHabitForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Habit
          </button>
          <button
            onClick={() => setShowSmartImport(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 shadow-md transition-all"
          >
            AI Goal Interview
          </button>
        </div>
      </div>

      {showBlockedTimeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add Time Block</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Label</label>
                <input 
                  type="text" 
                  placeholder="e.g., Lunch, Meeting, Commute" 
                  value={newBlockedTime.label} 
                  onChange={(e) => setNewBlockedTime({...newBlockedTime, label: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                  <input 
                    type="time" 
                    value={newBlockedTime.start} 
                    onChange={(e) => setNewBlockedTime({...newBlockedTime, start: e.target.value})} 
                    className="w-full px-3 py-2 border rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                  <input 
                    type="time" 
                    value={newBlockedTime.end} 
                    onChange={(e) => setNewBlockedTime({...newBlockedTime, end: e.target.value})} 
                    className="w-full px-3 py-2 border rounded-lg" 
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={addBlockedTime} className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">Add Time Block</button>
              <button onClick={() => setShowBlockedTimeForm(false)} className="px-4 py-2 bg-slate-300 rounded-lg hover:bg-slate-400">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showSmartImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold">AI Goal Interview</h3>
              <button onClick={() => { setShowSmartImport(false); setImportStep(1); setImportText(''); }}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {importStep === 1 && (
              <div>
                <p className="mb-4 text-slate-700">
                  <strong>Step 1:</strong> Copy this prompt and paste it into ChatGPT, Claude, or any AI assistant:
                </p>
                <textarea
                  value={promptTemplate}
                  readOnly
                  className="w-full h-64 px-3 py-2 border rounded-lg bg-slate-50 font-mono text-sm mb-3"
                />
                <div className="flex gap-3">
                  <button
                    onClick={copyPromptToClipboard}
                    className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Copy Prompt
                  </button>
                  <button
                    onClick={() => setImportStep(2)}
                    className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Next: Paste Response →
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  After copying, paste it into your AI, add your goals/tasks, and the AI will format them as JSON.
                </p>
              </div>
            )}

            {importStep === 2 && (
              <div>
                <p className="mb-4 text-slate-700">
                  <strong>Step 2:</strong> Paste the JSON response from the AI here:
                </p>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder='Paste the JSON response here (it should start with { and end with })'
                  className="w-full h-64 px-3 py-2 border rounded-lg font-mono text-sm mb-3"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setImportStep(1)}
                    className="px-6 py-2 bg-slate-300 rounded-lg hover:bg-slate-400"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSmartImport}
                    disabled={isImporting || !importText}
                    className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {isImporting ? 'Importing...' : 'Import'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showTodoForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add To-Do</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Task Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Email Professor Smith" 
                  value={newTodo.name} 
                  onChange={(e) => setNewTodo({...newTodo, name: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time Estimate (minutes)</label>
                <input 
                  type="number" 
                  placeholder="30" 
                  value={newTodo.timeEstimateMinutes} 
                  onChange={(e) => setNewTodo({...newTodo, timeEstimateMinutes: parseInt(e.target.value)})} 
                  className="w-full px-3 py-2 border rounded-lg" 
                />
                <p className="text-xs text-slate-500 mt-1">How long will this take?</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select 
                  value={newTodo.priority} 
                  onChange={(e) => setNewTodo({...newTodo, priority: parseInt(e.target.value)})} 
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value={1}>Priority 1 - Urgent</option>
                  <option value={2}>Priority 2 - Important</option>
                  <option value={3}>Priority 3 - Medium</option>
                  <option value={4}>Priority 4 - Low</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">1 = most urgent</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date (optional)</label>
                <input 
                  type="date" 
                  value={newTodo.dueDate} 
                  onChange={(e) => setNewTodo({...newTodo, dueDate: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg" 
                />
                <p className="text-xs text-slate-500 mt-1">Leave blank if no deadline</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={addTodo} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add To-Do</button>
              <button onClick={() => setShowTodoForm(false)} className="px-4 py-2 bg-slate-300 rounded-lg hover:bg-slate-400">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Build Portfolio Website" 
                  value={newProject.name} 
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total Hours Needed</label>
                <input 
                  type="number" 
                  placeholder="20" 
                  value={newProject.totalHoursNeeded} 
                  onChange={(e) => setNewProject({...newProject, totalHoursNeeded: parseFloat(e.target.value)})} 
                  className="w-full px-3 py-2 border rounded-lg" 
                />
                <p className="text-xs text-slate-500 mt-1">Estimate total time to complete</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hours Already Completed</label>
                <input 
                  type="number" 
                  placeholder="0" 
                  value={newProject.hoursCompleted} 
                  onChange={(e) => setNewProject({...newProject, hoursCompleted: parseFloat(e.target.value)})} 
                  className="w-full px-3 py-2 border rounded-lg" 
                />
                <p className="text-xs text-slate-500 mt-1">Enter 0 if just starting</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select 
                  value={newProject.priority} 
                  onChange={(e) => setNewProject({...newProject, priority: parseInt(e.target.value)})} 
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value={1}>Priority 1 - Urgent</option>
                  <option value={2}>Priority 2 - Important</option>
                  <option value={3}>Priority 3 - Medium</option>
                  <option value={4}>Priority 4 - Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date (optional)</label>
                <input 
                  type="date" 
                  value={newProject.startDate} 
                  onChange={(e) => setNewProject({...newProject, startDate: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date (optional)</label>
                <input 
                  type="date" 
                  value={newProject.dueDate} 
                  onChange={(e) => setNewProject({...newProject, dueDate: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg" 
                />
                <p className="text-xs text-slate-500 mt-1">When do you need this done?</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={addProject} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Project</button>
              <button onClick={() => setShowProjectForm(false)} className="px-4 py-2 bg-slate-300 rounded-lg hover:bg-slate-400">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showHabitForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add Recurring Habit</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Habit Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Morning Meditation" 
                  value={newHabit.name} 
                  onChange={(e) => setNewHabit({...newHabit, name: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
                <input 
                  type="number" 
                  placeholder="60" 
                  value={newHabit.durationMinutes} 
                  onChange={(e) => setNewHabit({...newHabit, durationMinutes: parseInt(e.target.value)})} 
                  className="w-full px-3 py-2 border rounded-lg" 
                />
                <p className="text-xs text-slate-500 mt-1">How long each session?</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Times Per Week</label>
                <input 
                  type="number" 
                  placeholder="7" 
                  value={newHabit.frequencyPerWeek} 
                  onChange={(e) => setNewHabit({...newHabit, frequencyPerWeek: parseInt(e.target.value)})} 
                  className="w-full px-3 py-2 border rounded-lg" 
                />
                <p className="text-xs text-slate-500 mt-1">7 = daily, 3 = three times per week</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select 
                  value={newHabit.priority} 
                  onChange={(e) => setNewHabit({...newHabit, priority: parseInt(e.target.value)})} 
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value={1}>Priority 1 - Most Important</option>
                  <option value={2}>Priority 2 - Important</option>
                  <option value={3}>Priority 3 - Medium</option>
                  <option value={4}>Priority 4 - Low</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">Higher priority habits schedule first</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={addHabit} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Add Habit</button>
              <button onClick={() => setShowHabitForm(false)} className="px-4 py-2 bg-slate-300 rounded-lg hover:bg-slate-400">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['today', 'todos', 'projects', 'habits', 'hall-of-fame', 'insights', 'profile'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ' + (activeTab === tab ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50')}
          >
            {tab === 'today' && '📅 Today'}
            {tab === 'todos' && '✅ To-Dos'}
            {tab === 'projects' && '🎯 Projects'}
            {tab === 'habits' && '🔄 Habits'}
            {tab === 'hall-of-fame' && '🏆 Hall of Fame'}
            {tab === 'insights' && '💡 Insights'}
            {tab === 'profile' && '🏅 Profile'}
          </button>
        ))}
      </div>

      {activeTab === 'today' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 rounded-xl p-6 text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-1">Today's Focus</h2>
            <p className="text-blue-100">
              {Math.floor(availableMinutes / 60)}h {availableMinutes % 60}m available
            </p>
          </div>

          {plan.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500 opacity-30" />
              <p className="text-xl font-semibold text-slate-700">All clear!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {plan.map((item, idx) => {
                const isCompleted = todayCompleted.includes(item.id);
                return (
                  <div
                    key={idx}
                    className={'bg-white rounded-xl p-5 border-2 ' + (isCompleted ? 'border-green-300 bg-green-50' : getUrgencyColor(item.urgency))}
                  >
                    <div className="flex justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex gap-2 mb-2">
                          <span className="text-base font-bold bg-white px-2 py-1.5 rounded">
                            {item.startTime} - {item.endTime}
                          </span>
                          <span className={'text-xs px-2 py-1 rounded-full ' + getPriorityColor(item.priority)}>
                            P{item.priority}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{item.name}</h3>
                        <p className="text-sm text-slate-600">{item.duration} minutes</p>
                      </div>
                      {!isCompleted && (
                        <button 
                          onClick={() => markComplete(item)} 
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Done
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'todos' && (
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">All To-Dos</h2>
          {todos.length === 0 ? (
            <p className="text-slate-500">No to-dos yet</p>
          ) : (
            <div className="space-y-2">
              {todos.map(todo => (
                <div key={todo.id} className="p-4 bg-slate-50 rounded-lg border">
                  {editingTodo === todo.id ? (
                    <div className="space-y-2">
                      <input 
                        value={todo.name} 
                        onChange={(e) => updateTodo(todo.id, 'name', e.target.value)} 
                        className="w-full px-3 py-2 border rounded" 
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input 
                          type="number" 
                          placeholder="Minutes"
                          value={todo.timeEstimateMinutes} 
                          onChange={(e) => updateTodo(todo.id, 'timeEstimateMinutes', parseInt(e.target.value))} 
                          className="px-3 py-2 border rounded" 
                        />
                        <select 
                          value={todo.priority} 
                          onChange={(e) => updateTodo(todo.id, 'priority', parseInt(e.target.value))}
                          className="px-3 py-2 border rounded"
                        >
                          <option value={1}>P1</option>
                          <option value={2}>P2</option>
                          <option value={3}>P3</option>
                          <option value={4}>P4</option>
                        </select>
                        <input 
                          type="date" 
                          value={todo.dueDate} 
                          onChange={(e) => updateTodo(todo.id, 'dueDate', e.target.value)} 
                          className="px-3 py-2 border rounded" 
                        />
                      </div>
                      <button onClick={() => setEditingTodo(null)} className="px-4 py-2 bg-green-600 text-white rounded">
                        <Save className="w-4 h-4 inline mr-1" />
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <div>
                        <div className="flex gap-2 items-center mb-1">
                          <span className={'text-xs px-2 py-1 rounded-full ' + getPriorityColor(todo.priority)}>
                            P{todo.priority}
                          </span>
                          {todo.status === 'completed' && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                              Completed
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold">{todo.name}</h3>
                        <p className="text-sm text-slate-600">
                          {todo.timeEstimateMinutes} min
                          {todo.dueDate && ' • Due: ' + new Date(todo.dueDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingTodo(todo.id)} className="p-2 hover:bg-slate-200 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteTodo(todo.id)} className="p-2 hover:bg-red-100 rounded text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">Projects</h2>
          {projects.length === 0 ? (
            <p className="text-slate-500">No projects yet</p>
          ) : (
            <div className="space-y-3">
              {projects.map(project => {
                const progress = ((project.hoursCompleted / project.totalHoursNeeded) * 100).toFixed(0);
                return (
                  <div key={project.id} className="p-4 bg-slate-50 rounded-lg border">
                    {editingProject === project.id ? (
                      <div className="space-y-2">
                        <input 
                          value={project.name} 
                          onChange={(e) => updateProject(project.id, 'name', e.target.value)} 
                          className="w-full px-3 py-2 border rounded" 
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="number" 
                            placeholder="Total hours"
                            value={project.totalHoursNeeded} 
                            onChange={(e) => updateProject(project.id, 'totalHoursNeeded', parseFloat(e.target.value))} 
                            className="px-3 py-2 border rounded" 
                          />
                          <input 
                            type="number" 
                            placeholder="Hours done"
                            value={project.hoursCompleted} 
                            onChange={(e) => updateProject(project.id, 'hoursCompleted', parseFloat(e.target.value))} 
                            className="px-3 py-2 border rounded" 
                          />
                          <select 
                            value={project.priority} 
                            onChange={(e) => updateProject(project.id, 'priority', parseInt(e.target.value))}
                            className="px-3 py-2 border rounded"
                          >
                            <option value={1}>P1</option>
                            <option value={2}>P2</option>
                            <option value={3}>P3</option>
                            <option value={4}>P4</option>
                          </select>
                          <input 
                            type="date" 
                            placeholder="Due date"
                            value={project.dueDate} 
                            onChange={(e) => updateProject(project.id, 'dueDate', e.target.value)} 
                            className="px-3 py-2 border rounded" 
                          />
                        </div>
                        <button onClick={() => setEditingProject(null)} className="px-4 py-2 bg-green-600 text-white rounded">
                          <Save className="w-4 h-4 inline mr-1" />
                          Save
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between mb-3">
                          <div>
                            <div className="flex gap-2 items-center mb-1">
                              <span className={'text-xs px-2 py-1 rounded-full ' + getPriorityColor(project.priority)}>
                                P{project.priority}
                              </span>
                              {project.dueDate && (
                                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                                  Due: {new Date(project.dueDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-bold">{project.name}</h3>
                            <p className="text-sm text-slate-600">
                              {project.hoursCompleted.toFixed(1)} / {project.totalHoursNeeded} hours
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setEditingProject(project.id)} 
                              className="p-2 hover:bg-slate-200 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => completeProject(project)} 
                              className="p-2 hover:bg-green-100 rounded text-green-600"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteProject(project.id)} 
                              className="p-2 hover:bg-red-100 rounded text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <div className="bg-blue-600 h-3 rounded-full" style={{width: progress + '%'}} />
                        </div>
                        <div className="mt-1 text-right text-sm font-bold text-slate-700">{progress}%</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'habits' && (
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">Recurring Habits</h2>
          {recurringHabits.length === 0 ? (
            <p className="text-slate-500">No habits yet</p>
          ) : (
            <div className="space-y-3">
              {recurringHabits.map(habit => {
                const progress = ((habit.weeklyCompleted / habit.frequencyPerWeek) * 100).toFixed(0);
                return (
                  <div key={habit.id} className="p-4 bg-slate-50 rounded-lg border">
                    {editingHabit === habit.id ? (
                      <div className="space-y-2">
                        <input 
                          value={habit.name} 
                          onChange={(e) => updateHabit(habit.id, 'name', e.target.value)} 
                          className="w-full px-3 py-2 border rounded" 
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <input 
                            type="number" 
                            placeholder="Minutes" 
                            value={habit.durationMinutes} 
                            onChange={(e) => updateHabit(habit.id, 'durationMinutes', parseInt(e.target.value))} 
                            className="px-3 py-2 border rounded" 
                          />
                          <input 
                            type="number" 
                            placeholder="Per week" 
                            value={habit.frequencyPerWeek} 
                            onChange={(e) => updateHabit(habit.id, 'frequencyPerWeek', parseInt(e.target.value))} 
                            className="px-3 py-2 border rounded" 
                          />
                          <select 
                            value={habit.priority} 
                            onChange={(e) => updateHabit(habit.id, 'priority', parseInt(e.target.value))} 
                            className="px-3 py-2 border rounded"
                          >
                            <option value={1}>P1</option>
                            <option value={2}>P2</option>
                            <option value={3}>P3</option>
                            <option value={4}>P4</option>
                          </select>
                        </div>
                        <button 
                          onClick={() => setEditingHabit(null)} 
                          className="px-4 py-2 bg-green-600 text-white rounded"
                        >
                          <Save className="w-4 h-4 inline mr-1" />
                          Save
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between mb-3">
                          <div>
                            <div className="flex gap-2 items-center mb-1">
                              <span className={'text-xs px-2 py-1 rounded-full ' + getPriorityColor(habit.priority)}>
                                P{habit.priority}
                              </span>
                              <span className="text-xs px-2 py-1 bg-slate-200 rounded">
                                {habit.frequencyPerWeek}x/week
                              </span>
                            </div>
                            <h3 className="text-lg font-bold">{habit.name}</h3>
                            <p className="text-sm text-slate-600">
                              {habit.durationMinutes} min per session • {habit.weeklyCompleted}/{habit.frequencyPerWeek} this week
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setEditingHabit(habit.id)} 
                              className="p-2 hover:bg-slate-200 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteHabit(habit.id)} 
                              className="p-2 hover:bg-red-100 rounded text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <div className="bg-green-600 h-3 rounded-full" style={{width: progress + '%'}} />
                        </div>
                        <div className="mt-1 text-right text-sm font-bold text-slate-700">{progress}%</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'hall-of-fame' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-slate-800">In Progress This Month</h2>
            </div>
            <p className="text-slate-600 mb-6">Track your active work for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-700 mb-3">Recurring Habits</h3>
              {recurringHabits.length === 0 ? (
                <p className="text-slate-500 text-sm">No active habits</p>
              ) : (
                <div className="space-y-3">
                  {recurringHabits.map(habit => {
                    const weeksInMonth = 4;
                    const targetThisMonth = habit.frequencyPerWeek * weeksInMonth;
                    const currentProgress = habit.weeklyCompleted + (habit.totalHoursLogged > 0 ? Math.floor((habit.totalHoursLogged * 60) / habit.durationMinutes) : 0);
                    const percentage = ((currentProgress / targetThisMonth) * 100).toFixed(0);
                    
                    return (
                      <div key={habit.id} className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-slate-800">{habit.name}</h4>
                          <span className="text-sm font-bold text-blue-600">{currentProgress}/{targetThisMonth}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 mb-1">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all" 
                            style={{width: Math.min(parseFloat(percentage), 100) + '%'}} 
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>{habit.totalHoursLogged.toFixed(1)} hours logged</span>
                          <span>{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-3">Active Projects</h3>
              {projects.length === 0 ? (
                <p className="text-slate-500 text-sm">No active projects</p>
              ) : (
                <div className="space-y-3">
                  {projects.map(project => {
                    const percentage = ((project.hoursCompleted / project.totalHoursNeeded) * 100).toFixed(0);
                    const remaining = (project.totalHoursNeeded - project.hoursCompleted).toFixed(1);
                    
                    return (
                      <div key={project.id} className="p-4 bg-gradient-to-r from-slate-50 to-purple-50 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-slate-800">{project.name}</h4>
                          <span className="text-sm font-bold text-purple-600">{project.hoursCompleted.toFixed(1)}/{project.totalHoursNeeded}h</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 mb-1">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all" 
                            style={{width: Math.min(parseFloat(percentage), 100) + '%'}} 
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>{remaining}h remaining</span>
                          <span>{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-slate-800">Achievements</h2>
            </div>
            <p className="text-slate-600 mb-6">Your wins and completed work</p>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-700 mb-3">Monthly Streaks</h3>
              {recurringHabits.length === 0 ? (
                <p className="text-slate-500 text-sm">Complete habits to earn medals!</p>
              ) : (
                <div className="space-y-3">
                  {recurringHabits.map(habit => {
                    const monthlyTarget = habit.frequencyPerWeek * 4;
                    const completed = Math.floor((habit.totalHoursLogged * 60) / habit.durationMinutes);
                    const percentage = (completed / monthlyTarget) * 100;
                    
                    let medal = null;
                    let medalColor = '';
                    if (percentage >= 100) {
                      medal = '🥇';
                      medalColor = 'from-yellow-100 to-yellow-200 border-yellow-300';
                    } else if (percentage >= 90) {
                      medal = '🥈';
                      medalColor = 'from-slate-100 to-slate-200 border-slate-300';
                    } else if (percentage >= 75) {
                      medal = '🥉';
                      medalColor = 'from-orange-100 to-orange-200 border-orange-300';
                    }
                    
                    if (medal) {
                      return (
                        <div key={habit.id} className={'p-4 rounded-lg border-2 bg-gradient-to-r ' + medalColor}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{medal}</span>
                              <div>
                                <h4 className="font-bold text-slate-800">{habit.name}</h4>
                                <p className="text-sm text-slate-600">
                                  {completed}/{monthlyTarget} sessions ({percentage.toFixed(0)}%)
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-slate-500">This Month</div>
                              <div className="font-bold text-slate-700">
                                {percentage >= 100 ? 'Perfect!' : percentage >= 90 ? 'Strong!' : 'Good!'}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-3">Completed Projects</h3>
              {completedProjects.length === 0 ? (
                <p className="text-slate-500 text-sm">Complete projects to see them here!</p>
              ) : (
                <div className="space-y-3">
                  {completedProjects.map(project => (
                    <div key={project.id} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="font-bold text-green-900">{project.name}</h4>
                            <p className="text-sm text-green-700 mt-1">
                              Completed: {new Date(project.completionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p className="text-sm text-green-600 mt-1">
                              Total time: {project.hoursCompleted.toFixed(1)} hours
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg">
            <h1 className="text-2xl font-bold">Your Profile</h1>
            <p className="text-indigo-100 text-sm mt-1">Track your journey and celebrate your wins</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-yellow-300 text-center">
              <div className="text-4xl mb-2">🥇</div>
              <div className="text-2xl font-bold text-yellow-900">
                {recurringHabits.filter(h => {
                  const monthlyTarget = h.frequencyPerWeek * 4;
                  const completed = Math.floor((h.totalHoursLogged * 60) / h.durationMinutes);
                  return (completed / monthlyTarget) >= 1.0;
                }).length}
              </div>
              <div className="text-xs text-yellow-700">Gold Medals</div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border-2 border-slate-300 text-center">
              <div className="text-4xl mb-2">🥈</div>
              <div className="text-2xl font-bold text-slate-900">
                {recurringHabits.filter(h => {
                  const monthlyTarget = h.frequencyPerWeek * 4;
                  const completed = Math.floor((h.totalHoursLogged * 60) / h.durationMinutes);
                  const percentage = (completed / monthlyTarget) * 100;
                  return percentage >= 90 && percentage < 100;
                }).length}
              </div>
              <div className="text-xs text-slate-700">Silver Medals</div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border-2 border-orange-300 text-center">
              <div className="text-4xl mb-2">🥉</div>
              <div className="text-2xl font-bold text-orange-900">
                {recurringHabits.filter(h => {
                  const monthlyTarget = h.frequencyPerWeek * 4;
                  const completed = Math.floor((h.totalHoursLogged * 60) / h.durationMinutes);
                  const percentage = (completed / monthlyTarget) * 100;
                  return percentage >= 75 && percentage < 90;
                }).length}
              </div>
              <div className="text-xs text-orange-700">Bronze Medals</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-3">📊 Stats Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-700 mb-1">Total Hours</div>
                <div className="text-xl font-bold text-blue-900">
                  {(recurringHabits.reduce((sum, h) => sum + h.totalHoursLogged, 0) + 
                    projects.reduce((sum, p) => sum + p.hoursCompleted, 0)).toFixed(1)}
                </div>
              </div>

              <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="text-xs text-green-700 mb-1">Projects Done</div>
                <div className="text-xl font-bold text-green-900">{completedProjects.length}</div>
              </div>

              <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="text-xs text-purple-700 mb-1">Active Habits</div>
                <div className="text-xl font-bold text-purple-900">{recurringHabits.length}</div>
              </div>

              <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
                <div className="text-xs text-orange-700 mb-1">Task Rate</div>
                <div className="text-xl font-bold text-orange-900">
                  {todos.length > 0 ? Math.round((todos.filter(t => t.status === 'completed').length / todos.length) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-3">🏆 Recent Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recurringHabits.map(habit => {
                const monthlyTarget = habit.frequencyPerWeek * 4;
                const completed = Math.floor((habit.totalHoursLogged * 60) / habit.durationMinutes);
                const percentage = (completed / monthlyTarget) * 100;
                
                if (percentage >= 75) {
                  let medal = '';
                  let bgColor = '';
                  
                  if (percentage >= 100) {
                    medal = '🥇';
                    bgColor = 'from-yellow-50 to-orange-50 border-yellow-300';
                  } else if (percentage >= 90) {
                    medal = '🥈';
                    bgColor = 'from-slate-50 to-slate-100 border-slate-300';
                  } else {
                    medal = '🥉';
                    bgColor = 'from-orange-50 to-amber-50 border-orange-300';
                  }
                  
                  return (
                    <div key={habit.id} className={'p-3 rounded-lg border bg-gradient-to-br ' + bgColor}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-2xl">{medal}</div>
                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-slate-800">{habit.name}</h3>
                          <p className="text-xs text-slate-600">{completed}/{monthlyTarget} sessions • {percentage.toFixed(0)}%</p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }).filter(Boolean)}
              
              {completedProjects.slice(0, 4).map(project => (
                <div key={project.id} className="p-3 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 border-green-300">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">✅</div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-slate-800">{project.name}</h3>
                      <p className="text-xs text-slate-600">{project.hoursCompleted.toFixed(1)}h • {new Date(project.completionDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              ))}

              {recurringHabits.filter(h => {
                const monthlyTarget = h.frequencyPerWeek * 4;
                const completed = Math.floor((h.totalHoursLogged * 60) / h.durationMinutes);
                return (completed / monthlyTarget) >= 0.75;
              }).length === 0 && completedProjects.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <div className="text-4xl mb-2 opacity-30">🏆</div>
                  <p className="text-sm text-slate-600">Your achievements will appear here!</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-3">🎯 Milestones</h2>
            <div className="space-y-2">
              {recurringHabits.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-lg">☑</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-green-900">First Habit Created</div>
                    <div className="text-xs text-green-700">Started building your routine</div>
                  </div>
                </div>
              )}

              {(() => {
                const totalHours = recurringHabits.reduce((sum, h) => sum + h.totalHoursLogged, 0) + 
                                  projects.reduce((sum, p) => sum + p.hoursCompleted, 0);
                if (totalHours >= 100) {
                  return (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-lg">☑</div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-green-900">100 Hours Logged</div>
                        <div className="text-xs text-green-700">Serious dedication!</div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-lg">☐</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-700">100 Hours Logged</div>
                      <div className="text-xs text-slate-600">{totalHours.toFixed(1)}/100 hours</div>
                    </div>
                  </div>
                );
              })()}

              {completedProjects.length >= 1 ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-lg">☑</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-green-900">First Project Complete</div>
                    <div className="text-xs text-green-700">Ship it!</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-lg">☐</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-700">First Project Complete</div>
                    <div className="text-xs text-slate-600">Finish your first project</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-3">💾 Data Management</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm"
                title="Export your data as JSON"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 cursor-pointer text-sm">
                <Upload className="w-4 h-4" />
                Import Data
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
              <button
                onClick={clearAllData}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                title="Clear all data"
              >
                <RefreshCw className="w-4 h-4" />
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-slate-800">Time Distribution</h2>
            </div>
            <p className="text-slate-600 mb-6">Where your time goes this month</p>
            
            {recurringHabits.length === 0 && projects.length === 0 ? (
              <p className="text-slate-500 text-sm">Start logging time to see your distribution!</p>
            ) : (
              <div className="space-y-4">
                {(() => {
                  const totalHours = recurringHabits.reduce((sum, h) => sum + h.totalHoursLogged, 0) + 
                                    projects.reduce((sum, p) => sum + p.hoursCompleted, 0);
                  
                  const items = [
                    ...recurringHabits.map(h => ({ name: h.name, hours: h.totalHoursLogged, color: 'from-blue-500 to-indigo-500' })),
                    ...projects.map(p => ({ name: p.name, hours: p.hoursCompleted, color: 'from-purple-500 to-pink-500' }))
                  ].sort((a, b) => b.hours - a.hours);

                  return (
                    <>
                      {items.map((item, idx) => {
                        const percentage = totalHours > 0 ? ((item.hours / totalHours) * 100).toFixed(0) : 0;
                        return (
                          <div key={idx}>
                            <div className="flex justify-between mb-2">
                              <span className="font-semibold text-slate-700">{item.name}</span>
                              <span className="text-slate-600">{item.hours.toFixed(1)} hrs ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-4">
                              <div 
                                className={'h-4 rounded-full bg-gradient-to-r ' + item.color}
                                style={{width: percentage + '%'}}
                              />
                            </div>
                          </div>
                        );
                      })}
                      <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-lg border border-slate-200">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-slate-800">{totalHours.toFixed(1)}</div>
                          <div className="text-sm text-slate-600">Total Hours This Month</div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-slate-800">Productivity Stats</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="text-sm text-green-700 mb-1">Overall Completion</div>
                <div className="text-3xl font-bold text-green-900">
                  {(() => {
                    const totalTasks = todos.length;
                    const completedTasks = todos.filter(t => t.status === 'completed').length;
                    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                  })()}%
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {todos.filter(t => t.status === 'completed').length} of {todos.length} tasks
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="text-sm text-purple-700 mb-1">Active Projects</div>
                <div className="text-3xl font-bold text-purple-900">{projects.length}</div>
                <div className="text-xs text-purple-600 mt-1">
                  {completedProjects.length} completed all-time
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-700 mb-1">Active Habits</div>
                <div className="text-3xl font-bold text-blue-900">{recurringHabits.length}</div>
                <div className="text-xs text-blue-600 mt-1">
                  Building consistency
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-slate-800">Quick Insights</h2>
            </div>
            
            <div className="space-y-3">
              {recurringHabits.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <p className="text-slate-700">
                    💪 You're tracking <strong>{recurringHabits.length}</strong> recurring habits - building strong systems!
                  </p>
                </div>
              )}
              
              {projects.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <p className="text-slate-700">
                    🎯 <strong>{projects.length}</strong> projects in progress - you're making things happen!
                  </p>
                </div>
              )}
              
              {completedProjects.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <p className="text-slate-700">
                    ✅ <strong>{completedProjects.length}</strong> projects completed - celebrate those wins!
                  </p>
                </div>
              )}

              {recurringHabits.length === 0 && projects.length === 0 && todos.length === 0 && (
                <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                  <p className="text-slate-700">
                    🌟 Ready to start? Add your first habit, project, or to-do to begin tracking!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyAdaptivePlanner;
