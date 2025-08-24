import React from "react";
import { motion } from "framer-motion";
import { Check, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  className?: string;
  variant?: "horizontal" | "vertical";
  showConnectors?: boolean;
}

export const ProgressIndicator = ({
  steps,
  currentStep,
  completedSteps,
  className,
  variant = "horizontal",
  showConnectors = true,
}: ProgressIndicatorProps) => {
  const isStepCompleted = (stepIndex: number) => completedSteps.includes(stepIndex);
  const isStepCurrent = (stepIndex: number) => currentStep === stepIndex;
  const isStepUpcoming = (stepIndex: number) => stepIndex > currentStep;

  const getStepStatus = (stepIndex: number) => {
    if (isStepCompleted(stepIndex)) return "completed";
    if (isStepCurrent(stepIndex)) return "current";
    return "upcoming";
  };

  const StepConnector = ({ stepIndex }: { stepIndex: number }) => {
    if (!showConnectors || stepIndex === steps.length - 1) return null;
    
    const isConnectorActive = stepIndex < currentStep || isStepCompleted(stepIndex + 1);
    
    return (
      <div className={cn(
        "flex-1 h-0.5 mx-4",
        variant === "vertical" && "w-0.5 h-8 mx-auto my-2",
        isConnectorActive ? "bg-primary" : "bg-border"
      )}>
        {isConnectorActive && (
          <motion.div
            className={cn(
              "h-full bg-gradient-to-r from-primary to-success",
              variant === "vertical" && "w-full bg-gradient-to-b"
            )}
            initial={{ scaleX: 0, scaleY: variant === "vertical" ? 0 : 1 }}
            animate={{ scaleX: 1, scaleY: 1 }}
            transition={{ duration: 0.5, delay: stepIndex * 0.1 }}
          />
        )}
      </div>
    );
  };

  return (
    <div className={cn(
      "w-full",
      variant === "horizontal" ? "flex items-center" : "flex flex-col",
      className
    )}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        
        return (
          <React.Fragment key={step.id}>
            <div className={cn(
              "flex items-center",
              variant === "vertical" && "flex-col text-center"
            )}>
              {/* Step Circle */}
              <motion.div
                className={cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                  status === "completed" && "bg-success border-success text-success-foreground shadow-lg",
                  status === "current" && "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30 animate-pulse-glow",
                  status === "upcoming" && "bg-background border-border text-muted-foreground"
                )}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
              >
                {status === "completed" ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Check className="w-5 h-5" />
                  </motion.div>
                ) : status === "current" ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    {step.icon || <Circle className="w-5 h-5" />}
                  </motion.div>
                ) : (
                  step.icon || <span className="text-sm font-semibold">{index + 1}</span>
                )}
                
                {/* Glow Effect for Current Step */}
                {status === "current" && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/20"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>

              {/* Step Content */}
              {(variant === "vertical" || step.title) && (
                <motion.div
                  className={cn(
                    "ml-4",
                    variant === "vertical" && "ml-0 mt-2"
                  )}
                  initial={{ opacity: 0, x: variant === "vertical" ? 0 : -10, y: variant === "vertical" ? 10 : 0 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 + 0.1 }}
                >
                  <div className={cn(
                    "font-medium text-sm",
                    status === "completed" && "text-success",
                    status === "current" && "text-primary font-semibold",
                    status === "upcoming" && "text-muted-foreground"
                  )}>
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
            
            <StepConnector stepIndex={index} />
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProgressIndicator;