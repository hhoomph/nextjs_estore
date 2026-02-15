/**
 * Step Wizard Component for Multi-Step Processes
 * Modern wizard with progress indicators, animations, and accessibility
 *
 * @author hh.oomph@gmail.com
 * @version 2.0.0
 * @since 2025-01-01
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Loader2,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  validation?: () => boolean | Promise<boolean>;
  onEnter?: () => void | Promise<void>;
  onLeave?: () => void | Promise<void>;
}

interface StepWizardProps {
  steps: WizardStep[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: (data?: any) => void;
  onCancel?: () => void;
  showProgress?: boolean;
  showNavigation?: boolean;
  allowSkip?: boolean;
  loading?: boolean;
  variant?: "horizontal" | "vertical" | "compact";
  size?: "sm" | "md" | "lg";
  className?: string;
  stepData?: Record<string, any>;
  onStepDataChange?: (stepId: string, data: any) => void;
}

const StepWizard: React.FC<StepWizardProps> = ({
  steps,
  currentStep: controlledStep,
  onStepChange,
  onComplete,
  onCancel,
  showProgress = true,
  showNavigation = true,
  allowSkip = false,
  loading = false,
  variant = "horizontal",
  size = "md",
  className,
  stepData = {},
  onStepDataChange,
}) => {
  const [internalStep, setInternalStep] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(
    new Set(),
  );
  const [stepStates, setStepStates] = React.useState<
    Record<number, "idle" | "loading" | "error">
  >({});

  const currentStep = controlledStep ?? internalStep;
  const isControlled = controlledStep !== undefined;

  const handleStepChange = React.useCallback(
    async (newStep: number) => {
      if (newStep < 0 || newStep >= steps.length) return;

      const currentStepData = steps[currentStep];

      // Validate current step before leaving
      if (currentStepData.validation) {
        setStepStates((prev) => ({ ...prev, [currentStep]: "loading" }));

        try {
          const isValid = await currentStepData.validation();
          if (!isValid) {
            setStepStates((prev) => ({ ...prev, [currentStep]: "error" }));
            return;
          }
        } catch (error) {
          setStepStates((prev) => ({ ...prev, [currentStep]: "error" }));
          return;
        }

        setStepStates((prev) => ({ ...prev, [currentStep]: "idle" }));
      }

      // Call onLeave for current step
      if (currentStepData.onLeave) {
        await currentStepData.onLeave();
      }

      // Update completed steps
      if (newStep > currentStep) {
        setCompletedSteps((prev) => new Set([...prev, currentStep]));
      }

      // Call onEnter for new step
      const newStepData = steps[newStep];
      if (newStepData.onEnter) {
        await newStepData.onEnter();
      }

      // Update step
      if (!isControlled) {
        setInternalStep(newStep);
      }
      onStepChange?.(newStep);
    },
    [currentStep, steps, isControlled, onStepChange],
  );

  const handleNext = React.useCallback(() => {
    if (currentStep < steps.length - 1) {
      handleStepChange(currentStep + 1);
    } else {
      onComplete?.(stepData);
    }
  }, [currentStep, steps.length, handleStepChange, onComplete, stepData]);

  const handlePrevious = React.useCallback(() => {
    if (currentStep > 0) {
      handleStepChange(currentStep - 1);
    }
  }, [currentStep, handleStepChange]);

  const handleSkip = React.useCallback(() => {
    if (currentStep < steps.length - 1) {
      handleStepChange(currentStep + 1);
    }
  }, [currentStep, steps.length, handleStepChange]);

  const progress = ((currentStep + 1) / steps.length) * 100;

  const sizes = {
    sm: { step: "w-8 h-8", icon: "w-3 h-3", text: "text-xs" },
    md: { step: "w-10 h-10", icon: "w-4 h-4", text: "text-sm" },
    lg: { step: "w-12 h-12", icon: "w-5 h-5", text: "text-base" },
  };

  const currentSize = sizes[size];

  if (variant === "compact") {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Progress Bar */}
        {showProgress && (
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[200px]"
          >
            {steps[currentStep]?.content}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {showNavigation && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {allowSkip && currentStep < steps.length - 1 && (
                <Button variant="ghost" onClick={handleSkip} disabled={loading}>
                  Skip
                </Button>
              )}

              <Button
                onClick={handleNext}
                disabled={loading}
                className="min-w-[100px]"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {currentStep === steps.length - 1 ? "Complete" : "Next"}
                {!loading && currentStep < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 ml-2" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === "vertical") {
    return (
      <div className={cn("flex gap-8", className)}>
        {/* Steps Sidebar */}
        <div className="flex flex-col gap-4 min-w-[200px]">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = completedSteps.has(index);
            const hasError = stepStates[index] === "error";

            return (
              <motion.div
                key={step.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all",
                  isActive && "bg-primary/10 border border-primary/20",
                  isCompleted && "bg-green-50 border border-green-200",
                  hasError && "bg-red-50 border border-red-200",
                )}
                onClick={() => handleStepChange(index)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full border-2 transition-all",
                    currentSize.step,
                    isActive &&
                      "border-primary bg-primary text-primary-foreground",
                    isCompleted && "border-green-500 bg-green-500 text-white",
                    hasError && "border-red-500 bg-red-500 text-white",
                    !isActive &&
                      !isCompleted &&
                      !hasError &&
                      "border-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <Check className={currentSize.icon} />
                  ) : (
                    <span className={currentSize.text}>{index + 1}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className={cn(
                      "font-medium truncate",
                      currentSize.text,
                      isActive && "text-primary",
                      hasError && "text-red-600",
                    )}
                  >
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {step.description}
                    </p>
                  )}
                </div>

                {step.icon && (
                  <div className="text-muted-foreground">{step.icon}</div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[400px]"
            >
              {steps[currentStep]?.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className={cn("space-y-8", className)}>
      {/* Progress Steps */}
      {showProgress && (
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-4">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = completedSteps.has(index);
              const hasError = stepStates[index] === "error";

              return (
                <React.Fragment key={step.id}>
                  <motion.div
                    className={cn(
                      "flex flex-col items-center gap-2 cursor-pointer",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                    onClick={() => handleStepChange(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-full border-2 transition-all",
                        currentSize.step,
                        isActive &&
                          "border-primary bg-primary text-primary-foreground",
                        isCompleted &&
                          "border-green-500 bg-green-500 text-white",
                        hasError && "border-red-500 bg-red-500 text-white",
                        !isActive &&
                          !isCompleted &&
                          !hasError &&
                          "border-muted-foreground",
                      )}
                    >
                      {isCompleted ? (
                        <Check className={currentSize.icon} />
                      ) : stepStates[index] === "loading" ? (
                        <Loader2
                          className={cn(currentSize.icon, "animate-spin")}
                        />
                      ) : (
                        <span className={currentSize.text}>{index + 1}</span>
                      )}
                    </div>

                    <div className="text-center max-w-[120px]">
                      <h3
                        className={cn(
                          "font-medium truncate",
                          currentSize.text,
                          isActive && "text-primary",
                          hasError && "text-red-600",
                        )}
                      >
                        {step.title}
                      </h3>
                      {step.description && size !== "sm" && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </motion.div>

                  {index < steps.length - 1 && (
                    <motion.div
                      className={cn(
                        "h-px w-12 transition-colors",
                        isCompleted ? "bg-green-500" : "bg-muted-foreground/30",
                      )}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: index * 0.1 }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-[300px]"
        >
          {steps[currentStep]?.content}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {showNavigation && (
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {onCancel && (
              <Button variant="ghost" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {allowSkip && currentStep < steps.length - 1 && (
              <Button variant="ghost" onClick={handleSkip} disabled={loading}>
                Skip
              </Button>
            )}

            <Button
              onClick={handleNext}
              disabled={loading || stepStates[currentStep] === "error"}
              className="min-w-[120px]"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {currentStep === steps.length - 1 ? "Complete" : "Next"}
              {!loading && currentStep < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 ml-2" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export { StepWizard };
export type { StepWizardProps };
