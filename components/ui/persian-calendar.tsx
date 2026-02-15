/**
 * Module for persian-calendar
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

/**
 * Persian Calendar Date Picker Component
 *
 * A beautiful, accessible date picker component that supports both Gregorian and Persian calendars
 * with smooth animations, keyboard navigation, and comprehensive customization options.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  formatPersianDate,
  getPersianMonthCalendar,
  gregorianToPersian,
  isValidPersianDate,
  PERSIAN_MONTHS,
  PERSIAN_WEEKDAYS,
  persianCalendarUtils,
  persianToGregorian,
  toPersianNumbers,
} from "@/lib/utils/persian-calendar";

interface PersianCalendarProps {
  /**
   * Currently selected date
   */
  selectedDate?: Date;

  /**
   * Callback when date is selected
   */
  onDateSelect?: (
    date: Date,
    persianDate: { year: number; month: number; day: number },
  ) => void;

  /**
   * Calendar mode: 'persian', 'gregorian', or 'dual'
   */
  mode?: "persian" | "gregorian" | "dual";

  /**
   * Minimum selectable date
   */
  minDate?: Date;

  /**
   * Maximum selectable date
   */
  maxDate?: Date;

  /**
   * Whether to show today button
   */
  showTodayButton?: boolean;

  /**
   * Custom CSS classes
   */
  className?: string;

  /**
   * Whether the calendar is disabled
   */
  disabled?: boolean;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Whether to show time picker
   */
  showTimePicker?: boolean;

  /**
   * Highlighted dates (for events, holidays, etc.)
   */
  highlightedDates?: Date[];

  /**
   * Disabled dates
   */
  disabledDates?: Date[];
}

interface CalendarState {
  currentYear: number;
  currentMonth: number;
  selectedDate: Date | null;
  showCalendar: boolean;
  calendarData: ReturnType<typeof getPersianMonthCalendar> | null;
}

export function PersianCalendar({
  selectedDate,
  onDateSelect,
  mode = "persian",
  minDate,
  maxDate,
  showTodayButton = true,
  className,
  disabled = false,
  placeholder = "Select date...",
  showTimePicker = false,
  highlightedDates = [],
  disabledDates = [],
}: PersianCalendarProps) {
  const language = "fa"; // Default to Persian for this component
  const calendarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<CalendarState>({
    currentYear: 0,
    currentMonth: 0,
    selectedDate: selectedDate || null,
    showCalendar: false,
    calendarData: null,
  });

  // Initialize calendar with current date
  useEffect(() => {
    const today = new Date();
    const persianToday = gregorianToPersian(today);

    setState((prev) => ({
      ...prev,
      currentYear: persianToday.year,
      currentMonth: persianToday.month,
      selectedDate: selectedDate || null,
    }));
  }, [selectedDate]);

  // Update calendar data when year/month changes
  useEffect(() => {
    if (state.currentYear && state.currentMonth) {
      const calendarData = getPersianMonthCalendar(
        state.currentYear,
        state.currentMonth,
      );
      setState((prev) => ({ ...prev, calendarData }));
    }
  }, [state.currentYear, state.currentMonth]);

  // Handle date selection
  const handleDateSelect = useCallback(
    (day: number, isCurrentMonth: boolean) => {
      if (!isCurrentMonth || !state.calendarData) return;

      const selectedPersianDate = {
        year: state.currentYear,
        month: state.currentMonth,
        day,
      };

      if (
        !isValidPersianDate(
          selectedPersianDate.year,
          selectedPersianDate.month,
          selectedPersianDate.day,
        )
      ) {
        return;
      }

      const gregorianDate = persianToGregorian(
        selectedPersianDate.year,
        selectedPersianDate.month,
        selectedPersianDate.day,
      );

      // Check min/max constraints
      if (minDate && gregorianDate < minDate) return;
      if (maxDate && gregorianDate > maxDate) return;

      // Check disabled dates
      if (
        disabledDates.some(
          (date) => date.toDateString() === gregorianDate.toDateString(),
        )
      ) {
        return;
      }

      setState((prev) => ({
        ...prev,
        selectedDate: gregorianDate,
        showCalendar: false,
      }));

      onDateSelect?.(gregorianDate, selectedPersianDate);
    },
    [
      state.calendarData,
      state.currentYear,
      state.currentMonth,
      minDate,
      maxDate,
      disabledDates,
      onDateSelect,
    ],
  );

  // Navigate to previous/next month
  const navigateMonth = useCallback((direction: "prev" | "next") => {
    setState((prev) => {
      const nav = persianCalendarUtils.getNavigationOptions(
        prev.currentYear,
        prev.currentMonth,
      );
      return {
        ...prev,
        currentYear: direction === "prev" ? nav.prevYear : nav.nextYear,
        currentMonth: direction === "prev" ? nav.prevMonth : nav.nextMonth,
      };
    });
  }, []);

  // Go to today
  const goToToday = useCallback(() => {
    const today = new Date();
    const persianToday = gregorianToPersian(today);

    setState((prev) => ({
      ...prev,
      currentYear: persianToday.year,
      currentMonth: persianToday.month,
    }));
  }, []);

  // Format display value
  const getDisplayValue = useCallback(() => {
    if (!state.selectedDate) return "";

    const persianDate = gregorianToPersian(state.selectedDate);
    return formatPersianDate(
      persianDate.year,
      persianDate.month,
      persianDate.day,
      language,
    );
  }, [state.selectedDate, language]);

  // Check if date is highlighted
  const isHighlighted = useCallback(
    (date: Date) => {
      return highlightedDates.some(
        (highlightedDate) =>
          highlightedDate.toDateString() === date.toDateString(),
      );
    },
    [highlightedDates],
  );

  // Check if date is disabled
  const isDisabled = useCallback(
    (date: Date) => {
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return disabledDates.some(
        (disabledDate) => disabledDate.toDateString() === date.toDateString(),
      );
    },
    [minDate, maxDate, disabledDates],
  );

  // Handle input focus/blur
  const handleInputFocus = useCallback(() => {
    if (!disabled) {
      setState((prev) => ({ ...prev, showCalendar: true }));
    }
  }, [disabled]);

  const handleInputBlur = useCallback((e: React.FocusEvent) => {
    // Close calendar if focus moves outside
    setTimeout(() => {
      if (!calendarRef.current?.contains(document.activeElement)) {
        setState((prev) => ({ ...prev, showCalendar: false }));
      }
    }, 150);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setState((prev) => ({ ...prev, showCalendar: false }));
      inputRef.current?.blur();
    }
  }, []);

  if (!state.calendarData) {
    return <div className="animate-pulse h-10 bg-muted rounded-md" />;
  }

  return (
    <div className={cn("relative", className)} ref={calendarRef}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={getDisplayValue()}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={true}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "cursor-pointer",
          )}
        />
        <Calendar
          className={cn(
            "absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
            disabled && "opacity-50",
          )}
        />
        {state.selectedDate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setState((prev) => ({ ...prev, selectedDate: null }));
              onDateSelect?.(new Date(), { year: 0, month: 0, day: 0 });
            }}
            className="absolute left-2 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-destructive/10"
          >
            <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
          </Button>
        )}
      </div>

      {/* Calendar Dropdown */}
      {state.showCalendar && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-2 shadow-lg border animate-in fade-in-0 zoom-in-95">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              {/* Month/Year Navigation */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth("prev")}
                  className="h-7 w-7 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 min-w-32 justify-center">
                  <span className="text-sm font-medium">
                    {language === "fa"
                      ? `${PERSIAN_MONTHS.fa[state.currentMonth - 1]} ${toPersianNumbers(state.currentYear)}`
                      : `${PERSIAN_MONTHS.en[state.currentMonth - 1]} ${state.currentYear}`}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                  className="h-7 w-7 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>

              {/* Today Button */}
              {showTodayButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToToday}
                  className="text-xs"
                >
                  {language === "fa" ? "امروز" : "Today"}
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-0 border-b">
              {PERSIAN_WEEKDAYS[language].map((weekday, index) => (
                <div
                  key={index}
                  className="p-3 text-center text-xs font-medium text-muted-foreground border-l last:border-l-0"
                >
                  {weekday}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0">
              {state.calendarData.days.map((dayData, index) => {
                const isSelected =
                  state.selectedDate &&
                  gregorianToPersian(state.selectedDate).year ===
                    state.currentYear &&
                  gregorianToPersian(state.selectedDate).month ===
                    state.currentMonth &&
                  gregorianToPersian(state.selectedDate).day === dayData.day &&
                  dayData.isCurrentMonth;

                const isToday = dayData.isToday;
                const isHighlightedDate = isHighlighted(dayData.gregorianDate);
                const isDisabledDate = isDisabled(dayData.gregorianDate);

                return (
                  <button
                    key={index}
                    onClick={() =>
                      handleDateSelect(dayData.day, dayData.isCurrentMonth)
                    }
                    disabled={isDisabledDate || disabled}
                    className={cn(
                      "relative p-3 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "border-l last:border-l-0 min-h-12 flex items-center justify-center",
                      // Current month styling
                      dayData.isCurrentMonth
                        ? "text-foreground"
                        : "text-muted-foreground",
                      // Selection styling
                      isSelected &&
                        "style={{ backgroundColor: 'rgb(59, 130, 246)' }} style={{ color: 'rgb(59, 130, 246)' }}-foreground hover:style={{ backgroundColor: 'rgb(59, 130, 246)' }}/90",
                      // Today styling
                      isToday && !isSelected && "bg-accent font-semibold",
                      // Highlighted dates
                      isHighlightedDate &&
                        !isSelected &&
                        "bg-yellow-50 text-yellow-900 border-yellow-200",
                      // Disabled dates
                      isDisabledDate && "opacity-30 cursor-not-allowed",
                    )}
                  >
                    <span
                      className={cn(
                        language === "fa" && "font-vazirmatn",
                        isToday &&
                          dayData.isCurrentMonth &&
                          "ring-2 ring-blue-500 ring-offset-1 rounded-full w-6 h-6 flex items-center justify-center",
                      )}
                    >
                      {language === "fa"
                        ? toPersianNumbers(dayData.day)
                        : dayData.day}
                    </span>

                    {/* Holiday indicator */}
                    {isHighlightedDate && (
                      <div className="absolute top-1 right-1 w-1 h-1 bg-yellow-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer with quick actions */}
            <div className="border-t p-3 flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                {state.selectedDate && (
                  <span>
                    {language === "fa" ? "انتخاب شده: " : "Selected: "}
                    {getDisplayValue()}
                  </span>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setState((prev) => ({ ...prev, showCalendar: false }))
                }
                className="text-xs"
              >
                {language === "fa" ? "بستن" : "Close"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Export additional calendar components for more complex use cases
export {
  formatPersianDate,
  gregorianToPersian,
  persianToGregorian,
} from "@/lib/utils/persian-calendar";
