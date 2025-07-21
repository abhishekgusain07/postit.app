// "use client";

// import React, { useState, useMemo } from 'react';
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { ChevronLeft, ChevronRight, Plus, Search, Settings, Calendar as CalendarIcon, List, MoreHorizontal } from "lucide-react";
// import { 
//   format, 
//   startOfMonth, 
//   endOfMonth, 
//   eachDayOfInterval, 
//   isSameMonth, 
//   isToday, 
//   isSameDay, 
//   addMonths, 
//   subMonths, 
//   getDay,
//   startOfWeek,
//   endOfWeek,
//   startOfDay,
//   endOfDay,
//   addDays,
//   subDays
// } from "date-fns";
// import Image from "next/image";

// // Types for our calendar events (scheduled posts)
// interface CalendarEvent {
//   id: string;
//   title: string;
//   date: Date;
//   platform: string;
//   platformIcon: string;
//   status: 'scheduled' | 'published' | 'failed' | 'holiday';
//   color?: string; // for event pill color
// }

// // Dummy data for demonstration
// const dummyEvents: CalendarEvent[] = [
//   {
//     id: '1',
//     title: 'Buddha Purnima/Vesak',
//     date: new Date(2025, 4, 12, 0, 0),
//     platform: 'Holiday',
//     platformIcon: '',
//     status: 'holiday',
//     color: 'bg-green-700'
//   },
//   {
//     id: '2',
//     title: 'Birthday of Rabindranat',
//     date: new Date(2025, 4, 9, 0, 0),
//     platform: 'Holiday',
//     platformIcon: '',
//     status: 'holiday',
//     color: 'bg-green-700'
//   },
//   {
//     id: '3',
//     title: '8:45am First Study session',
//     date: new Date(2025, 4, 13, 8, 45),
//     platform: 'Personal',
//     platformIcon: '',
//     status: 'scheduled',
//     color: 'bg-blue-600'
//   },
//   {
//     id: '4',
//     title: 'Team Meeting',
//     date: new Date(2025, 4, 19, 14, 0),
//     platform: 'YouTube',
//     platformIcon: '/platforms/youtube.png',
//     status: 'scheduled',
//     color: 'bg-blue-500'
//   }
// ];

// const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// const CalendarPage = () => {
//   const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 1)); // May 2025 for demo
//   const [view, setView] = useState<'month' | 'week' | 'day'>('month');

//   // Navigation functions
//   const navigate = (direction: 'prev' | 'next') => {
//     switch (view) {
//       case 'month':
//         setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
//         break;
//       case 'week':
//         setCurrentDate(direction === 'prev' ? subDays(currentDate, 7) : addDays(currentDate, 7));
//         break;
//       case 'day':
//         setCurrentDate(direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1));
//         break;
//     }
//   };

//   const goToToday = () => setCurrentDate(new Date());

//   // Get events for a specific day
//   const getEventsForDay = (date: Date) => {
//     return dummyEvents.filter(event => isSameDay(event.date, date));
//   };

//   // Compute calendar data based on view
//   const calendarData = useMemo(() => {
//     switch (view) {
//       case 'month': {
//         const monthStart = startOfMonth(currentDate);
//         const monthEnd = endOfMonth(currentDate);
//         const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
//         const firstDayIdx = getDay(monthStart);
//         return { days, firstDayIdx };
//       }
//       case 'week': {
//         const weekStart = startOfWeek(currentDate);
//         const weekEnd = endOfWeek(currentDate);
//         const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
//         return { days };
//       }
//       case 'day': {
//         const dayStart = startOfDay(currentDate);
//         const dayEnd = endOfDay(currentDate);
//         return { days: [currentDate] };
//       }
//     }
//   }, [currentDate, view]);

//   // Render calendar header based on view
//   const renderCalendarHeader = () => {
//     let headerText = '';
//     switch (view) {
//       case 'month':
//         headerText = format(currentDate, 'MMMM yyyy');
//         break;
//       case 'week':
//         headerText = `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`;
//         break;
//       case 'day':
//         headerText = format(currentDate, 'MMMM d, yyyy');
//         break;
//     }
//     return headerText;
//   };

//   // Render calendar grid based on view
//   const renderCalendarGrid = () => {
//     switch (view) {
//       case 'month':
//         return (
//           <div className="grid grid-cols-7 gap-px bg-[#232323] rounded-2xl overflow-hidden">
//             {/* Calendar Header */}
//             {daysOfWeek.map((day) => (
//               <div
//                 key={day}
//                 className="bg-[#181818] p-3 text-center text-xs font-semibold tracking-wide text-gray-300 border-b border-[#232323]"
//               >
//                 {day}
//               </div>
//             ))}

//             {/* Empty cells for alignment */}
//             {Array.from({ length: calendarData.firstDayIdx }).map((_, idx) => (
//               <div key={"empty-" + idx} className="bg-[#181818] min-h-[90px]" />
//             ))}

//             {/* Calendar Days */}
//             {calendarData.days.map((day) => {
//               const events = getEventsForDay(day);
//               return (
//                 <div
//                   key={day.toString()}
//                   className={`min-h-[90px] p-2 border border-[#232323] flex flex-col rounded-lg relative group ${
//                     isSameMonth(day, currentDate)
//                       ? 'bg-[#181818]' : 'bg-[#232323] opacity-60'
//                   }`}
//                 >
//                   <div className="flex items-center justify-between mb-1">
//                     <span
//                       className={`text-xs font-semibold ${
//                         isToday(day)
//                           ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg'
//                           : 'text-gray-300'
//                       }`}
//                     >
//                       {format(day, 'd')}
//                     </span>
//                   </div>
//                   <div className="flex flex-col gap-1">
//                     {events.map((event) => (
//                       <div
//                         key={event.id}
//                         className={`truncate flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${event.color || 'bg-blue-600'} text-white hover:brightness-110 transition-all`}
//                         title={event.title}
//                       >
//                         {event.platformIcon && (
//                           <span className="relative w-4 h-4 mr-1">
//                             <Image
//                               src={event.platformIcon}
//                               alt={event.platform}
//                               fill
//                               className="object-contain"
//                             />
//                           </span>
//                         )}
//                         {event.title.length > 18 ? event.title.slice(0, 16) + '…' : event.title}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         );
      
//       case 'week':
//         return (
//           <div className="grid grid-cols-7 gap-px bg-[#232323] rounded-2xl overflow-hidden">
//             {daysOfWeek.map((day, index) => {
//               const weekDay = calendarData.days[index];
//               const events = getEventsForDay(weekDay);
//               return (
//                 <div 
//                   key={day} 
//                   className={`min-h-[400px] p-4 border border-[#232323] flex flex-col rounded-lg ${
//                     isToday(weekDay) ? 'bg-[#2c2c2c]' : 'bg-[#181818]'
//                   }`}
//                 >
//                   <div className="flex justify-between items-center mb-4">
//                     <span className={`text-sm font-semibold ${
//                       isToday(weekDay) 
//                         ? 'text-blue-500' 
//                         : 'text-gray-300'
//                     }`}>
//                       {day} {format(weekDay, 'd')}
//                     </span>
//                   </div>
//                   <div className="space-y-2">
//                     {events.map((event) => (
//                       <div
//                         key={event.id}
//                         className={`p-2 rounded-lg text-xs font-medium cursor-pointer ${event.color || 'bg-blue-600'} text-white hover:brightness-110 transition-all`}
//                       >
//                         <div className="flex items-center gap-2">
//                           {event.platformIcon && (
//                             <span className="relative w-4 h-4">
//                               <Image
//                                 src={event.platformIcon}
//                                 alt={event.platform}
//                                 fill
//                                 className="object-contain"
//                               />
//                             </span>
//                           )}
//                           <span>{event.title}</span>
//                         </div>
//                         <div className="text-xs text-white/70 mt-1">
//                           {format(event.date, 'h:mm a')}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         );
      
//       case 'day':
//         return (
//           <div className="bg-[#181818] p-6 rounded-2xl">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {/* Time Slots */}
//               {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23].map((hour) => {
//                 const hourDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hour);
//                 const events = getEventsForDay(hourDate);
//                 return (
//                   <div 
//                     key={hour} 
//                     className="bg-[#232323] rounded-lg p-4 min-h-[100px]"
//                   >
//                     <div className="text-sm font-semibold text-gray-300 mb-2">
//                       {format(hourDate, 'h a')}
//                     </div>
//                     {events.map((event) => (
//                       <div
//                         key={event.id}
//                         className={`p-2 rounded-lg text-xs font-medium cursor-pointer ${event.color || 'bg-blue-600'} text-white hover:brightness-110 transition-all mb-2`}
//                       >
//                         <div className="flex items-center gap-2">
//                           {event.platformIcon && (
//                             <span className="relative w-4 h-4">
//                               <Image
//                                 src={event.platformIcon}
//                                 alt={event.platform}
//                                 fill
//                                 className="object-contain"
//                               />
//                             </span>
//                           )}
//                           <span>{event.title}</span>
//                         </div>
//                         <div className="text-xs text-white/70 mt-1">
//                           {format(event.date, 'h:mm a')}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         );
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#181818] text-white">
//       {/* Header */}
//       <div className="flex items-center justify-between px-6 pt-6 pb-4">
//         <div className="flex items-center gap-2">
//           <Button variant="secondary" className="rounded-full px-4 py-1 text-base font-medium" onClick={goToToday}>
//             Today
//           </Button>
//           <Button variant="ghost" size="icon" onClick={() => navigate('prev')}>
//             <ChevronLeft className="h-5 w-5" />
//           </Button>
//           <Button variant="ghost" size="icon" onClick={() => navigate('next')}>
//             <ChevronRight className="h-5 w-5" />
//           </Button>
//           <span className="text-2xl font-semibold ml-4">
//             {renderCalendarHeader()}
//           </span>
//         </div>
//         <div className="flex items-center gap-2">
//           <Button variant="ghost" size="icon"><Search className="h-5 w-5" /></Button>
//           <Button variant="ghost" size="icon"><Settings className="h-5 w-5" /></Button>
//           <Select value={view} onValueChange={(value: 'month' | 'week' | 'day') => setView(value)}>
//             <SelectTrigger className="w-[110px] bg-[#232323] border-none text-white">
//               <SelectValue placeholder="Month" />
//             </SelectTrigger>
//             <SelectContent className="bg-[#232323] text-white">
//               <SelectItem value="month">Month</SelectItem>
//               <SelectItem value="week">Week</SelectItem>
//               <SelectItem value="day">Day</SelectItem>
//             </SelectContent>
//           </Select>
//           <Button variant="outline" className="rounded-full bg-[#232323] border-none text-white hover:bg-[#333]">
//             <CalendarIcon className="h-5 w-5 mr-2" />
//             <span>Month</span>
//           </Button>
//           <Button variant="outline" className="rounded-full bg-[#232323] border-none text-white hover:bg-[#333]">
//             <List className="h-5 w-5 mr-2" />
//             <span>Schedule</span>
//           </Button>
//           <Button variant="outline" className="rounded-full bg-[#232323] border-none text-white hover:bg-[#333]">
//             <MoreHorizontal className="h-5 w-5" />
//           </Button>
//         </div>
//       </div>

//       {/* Calendar Card */}
//       <div className="px-4 md:px-8 pb-8">
//         <Card className="rounded-2xl overflow-hidden bg-[#232323] border-none shadow-lg">
//           <CardContent className="p-0">
//             {renderCalendarGrid()}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default CalendarPage; 

const Calendar = () => {
  return (
    <div>
      Calendar Page.
    </div>
  )
}
export default Calendar;