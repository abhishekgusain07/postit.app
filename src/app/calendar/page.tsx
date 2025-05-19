"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from "date-fns";
import Image from "next/image";

// Types for our calendar events (scheduled posts)
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  platform: string;
  platformIcon: string;
  status: 'scheduled' | 'published' | 'failed';
}

// Dummy data for demonstration
const dummyEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Product Launch Announcement',
    date: new Date(2024, 3, 15, 10, 0),
    platform: 'Instagram',
    platformIcon: '/platforms/instagram.png',
    status: 'scheduled'
  },
  {
    id: '2',
    title: 'Weekly Tech Update',
    date: new Date(2024, 3, 15, 14, 0),
    platform: 'YouTube',
    platformIcon: '/platforms/youtube.png',
    status: 'scheduled'
  },
  {
    id: '3',
    title: 'Company News',
    date: new Date(2024, 3, 16, 9, 0),
    platform: 'LinkedIn',
    platformIcon: '/platforms/linkedin.png',
    status: 'scheduled'
  }
];

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  // Get all days in the current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Navigation functions
  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return dummyEvents.filter(event => isSameDay(event.date, date));
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Calendar</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium">
              {format(currentDate, 'MMMM yyyy')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select value={view} onValueChange={(value: 'month' | 'week' | 'day') => setView(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-border">
            {/* Calendar Header */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="bg-muted/50 p-2 text-center text-sm font-medium"
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {days.map((day, dayIdx) => {
              const events = getEventsForDay(day);
              return (
                <div
                  key={day.toString()}
                  className={`min-h-[120px] p-2 ${
                    isSameMonth(day, currentDate)
                      ? 'bg-background'
                      : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm ${
                        isToday(day)
                          ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center'
                          : ''
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded bg-primary/10 hover:bg-primary/20 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-1">
                          <div className="relative w-4 h-4">
                            <Image
                              src={event.platformIcon}
                              alt={event.platform}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span className="truncate">{event.title}</span>
                        </div>
                        <div className="text-muted-foreground">
                          {format(event.date, 'h:mm a')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage; 