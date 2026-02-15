/**
 * Module for accessibility-testing
 *
 * Comprehensive WCAG 2.1 AA accessibility testing and compliance monitoring
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { z } from "zod";

// Accessibility violation types
export interface AccessibilityViolation {
  rule: string;
  description: string;
  impact: "minor" | "moderate" | "serious" | "critical";
  level: "A" | "AA" | "AAA";
  help: string;
  helpUrl: string;
  nodes: Array<{
    target: string;
    html: string;
    failureSummary: string;
  }>;
  tags: string[];
}

// Test result structure
export interface AccessibilityTestResult {
  timestamp: number;
  url: string;
  violations: AccessibilityViolation[];
  passes: number;
  incomplete: number;
  inapplicable: number;
  score: number; // 0-100
  summary: {
    totalViolations: number;
    criticalViolations: number;
    seriousViolations: number;
    moderateViolations: number;
    minorViolations: number;
    complianceLevel: "A" | "AA" | "AAA" | "Fail";
  };
  recommendations: string[];
}

// Accessibility configuration
export interface AccessibilityConfig {
  enableAutomatedTesting: boolean;
  enableRealTimeChecking: boolean;
  enableKeyboardNavigation: boolean;
  enableScreenReader: boolean;
  enableColorContrast: boolean;
  enableFocusManagement: boolean;
  testFrequency: "continuous" | "on-demand" | "scheduled";
  complianceLevel: "A" | "AA" | "AAA";
  customRules: Record<string, any>;
  excludePatterns: string[];
  includePatterns: string[];
}

// Main accessibility tester class
export class AccessibilityTester {
  private config: AccessibilityConfig;
  private results: AccessibilityTestResult[] = [];
  private observers: MutationObserver[] = [];
  private isMonitoring = false;

  constructor(config: Partial<AccessibilityConfig> = {}) {
    this.config = {
      enableAutomatedTesting: true,
      enableRealTimeChecking: true,
      enableKeyboardNavigation: true,
      enableScreenReader: true,
      enableColorContrast: true,
      enableFocusManagement: true,
      testFrequency: "continuous",
      complianceLevel: "AA",
      customRules: {},
      excludePatterns: [],
      includePatterns: ["*"],
      ...config,
    };
  }

  // Start accessibility monitoring
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return;

    console.log("♿ Starting Comprehensive Accessibility Testing...");

    this.isMonitoring = true;

    if (this.config.enableRealTimeChecking) {
      this.setupRealTimeMonitoring();
    }

    if (this.config.enableKeyboardNavigation) {
      this.setupKeyboardNavigation();
    }

    if (this.config.enableFocusManagement) {
      this.setupFocusManagement();
    }

    console.log("✅ Accessibility monitoring started");
  }

  // Stop accessibility monitoring
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    console.log("🛑 Stopping Accessibility Monitoring...");

    this.isMonitoring = false;

    // Disconnect observers
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];

    console.log("✅ Accessibility monitoring stopped");
  }

  // Run comprehensive accessibility test
  async runAccessibilityTest(url?: string): Promise<AccessibilityTestResult> {
    const testUrl =
      url || (typeof window !== "undefined" ? window.location.href : "");
    console.log(`🧪 Running accessibility test on: ${testUrl}`);

    const violations = await this.performAutomatedTesting();
    const result = this.generateTestResult(testUrl, violations);

    this.results.push(result);

    // Keep only recent results
    if (this.results.length > 50) {
      this.results = this.results.slice(-50);
    }

    return result;
  }

  // Perform automated accessibility testing
  private async performAutomatedTesting(): Promise<AccessibilityViolation[]> {
    const violations: AccessibilityViolation[] = [];

    if (typeof window === "undefined" || !document) return violations;

    // Color contrast testing
    if (this.config.enableColorContrast) {
      violations.push(...this.checkColorContrast());
    }

    // Heading structure
    violations.push(...this.checkHeadingStructure());

    // Image alt text
    violations.push(...this.checkImageAltText());

    // Form accessibility
    violations.push(...this.checkFormAccessibility());

    // ARIA attributes
    violations.push(...this.checkAriaAttributes());

    // Keyboard navigation
    violations.push(...this.checkKeyboardNavigation());

    // Link accessibility
    violations.push(...this.checkLinkAccessibility());

    // Table accessibility
    violations.push(...this.checkTableAccessibility());

    // Language attributes
    violations.push(...this.checkLanguageAttributes());

    return violations;
  }

  // Color contrast checking
  private checkColorContrast(): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];

    // Get all text elements
    const textElements = document.querySelectorAll("*");

    textElements.forEach((element) => {
      const style = window.getComputedStyle(element);
      const text = element.textContent?.trim();

      if (!text || text.length === 0) return;

      const foreground = style.color;
      const background = this.getBackgroundColor(element);

      const contrast = this.calculateColorContrast(foreground, background);

      if (contrast < 4.5) {
        // WCAG AA requires 4.5:1 for normal text
        violations.push({
          rule: "color-contrast",
          description: `Insufficient color contrast ratio: ${contrast.toFixed(2)}:1`,
          impact: "serious",
          level: "AA",
          help: "Ensure text has sufficient contrast against its background",
          helpUrl: "https://www.w3.org/WAI/WCAG21/quickref/#contrast-minimum",
          nodes: [
            {
              target: this.getElementSelector(element),
              html: element.outerHTML.substring(0, 100) + "...",
              failureSummary: `Text contrast ratio ${contrast.toFixed(2)}:1 is below 4.5:1 requirement`,
            },
          ],
          tags: ["color", "contrast"],
        });
      }
    });

    return violations;
  }

  // Heading structure checking
  private checkHeadingStructure(): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];

    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const headingLevels = Array.from(headings).map((h) =>
      parseInt(h.tagName.charAt(1)),
    );

    // Check for missing h1
    const h1Count = document.querySelectorAll("h1").length;
    if (h1Count === 0) {
      violations.push({
        rule: "page-has-heading-one",
        description: "Page is missing a level-one heading",
        impact: "moderate",
        level: "A",
        help: "Add an h1 element to the page",
        helpUrl: "https://www.w3.org/WAI/WCAG21/quickref/#page-has-heading-one",
        nodes: [
          {
            target: "html",
            html: "<html>...</html>",
            failureSummary: "No h1 element found on page",
          },
        ],
        tags: ["heading", "structure"],
      });
    }

    // Check for skipped heading levels
    let lastLevel = 0;
    headingLevels.forEach((level, index) => {
      if (level - lastLevel > 1 && lastLevel !== 0) {
        const heading = headings[index];
        violations.push({
          rule: "heading-order",
          description: `Heading level skipped from h${lastLevel} to h${level}`,
          impact: "moderate",
          level: "A",
          help: "Ensure heading levels are in sequential order",
          helpUrl: "https://www.w3.org/WAI/WCAG21/quickref/#heading-order",
          nodes: [
            {
              target: this.getElementSelector(heading),
              html: heading.outerHTML,
              failureSummary: `Skipped heading level from h${lastLevel} to h${level}`,
            },
          ],
          tags: ["heading", "structure"],
        });
      }
      lastLevel = level;
    });

    return violations;
  }

  // Image alt text checking
  private checkImageAltText(): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];

    const images = document.querySelectorAll('img, [role="img"]');

    images.forEach((img) => {
      const alt = img.getAttribute("alt");
      const ariaLabel = img.getAttribute("aria-label");
      const ariaLabelledBy = img.getAttribute("aria-labelledby");
      const role = img.getAttribute("role");

      // Decorative images should have empty alt or role="presentation"
      if (
        this.isDecorativeImage(img) &&
        alt !== "" &&
        role !== "presentation"
      ) {
        violations.push({
          rule: "image-alt",
          description:
            'Decorative image should have empty alt text or role="presentation"',
          impact: "minor",
          level: "A",
          help: 'Remove alt text or add role="presentation" for decorative images',
          helpUrl: "https://www.w3.org/WAI/WCAG21/quickref/#images-of-text",
          nodes: [
            {
              target: this.getElementSelector(img),
              html: img.outerHTML,
              failureSummary: "Decorative image has non-empty alt text",
            },
          ],
          tags: ["image", "alt-text"],
        });
      }
      // Meaningful images must have alt text
      else if (
        !this.isDecorativeImage(img) &&
        !alt &&
        !ariaLabel &&
        !ariaLabelledBy
      ) {
        violations.push({
          rule: "image-alt",
          description: "Image is missing alt text",
          impact: "critical",
          level: "A",
          help: "Add descriptive alt text to images",
          helpUrl: "https://www.w3.org/WAI/WCAG21/quickref/#images-of-text",
          nodes: [
            {
              target: this.getElementSelector(img),
              html: img.outerHTML,
              failureSummary: "Image missing alt attribute",
            },
          ],
          tags: ["image", "alt-text"],
        });
      }
    });

    return violations;
  }

  // Form accessibility checking
  private checkFormAccessibility(): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];

    // Check form labels
    const inputs = document.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      const type = input.getAttribute("type");
      if (type === "hidden" || type === "submit") return;

      const id = input.id;
      const label = document.querySelector(`label[for="${id}"]`);
      const ariaLabel = input.getAttribute("aria-label");
      const ariaLabelledBy = input.getAttribute("aria-labelledby");
      const title = input.getAttribute("title");

      if (!label && !ariaLabel && !ariaLabelledBy && !title) {
        violations.push({
          rule: "label",
          description: "Form control is missing a label",
          impact: "critical",
          level: "A",
          help: "Add a label element or aria-label attribute",
          helpUrl:
            "https://www.w3.org/WAI/WCAG21/quickref/#labels-or-instructions",
          nodes: [
            {
              target: this.getElementSelector(input),
              html: input.outerHTML,
              failureSummary: "Form control missing label",
            },
          ],
          tags: ["form", "label"],
        });
      }
    });

    return violations;
  }

  // ARIA attributes checking
  private checkAriaAttributes(): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];

    // Check for invalid ARIA attributes
    const elements = document.querySelectorAll("[aria-*]");
    elements.forEach((element) => {
      const ariaAttributes = Array.from(element.attributes).filter((attr) =>
        attr.name.startsWith("aria-"),
      );

      ariaAttributes.forEach((attr) => {
        const value = attr.value;

        // Check aria-hidden
        if (attr.name === "aria-hidden" && !["true", "false"].includes(value)) {
          violations.push({
            rule: "aria-valid-attr-value",
            description: "aria-hidden must be true or false",
            impact: "critical",
            level: "A",
            help: 'Use aria-hidden="true" or aria-hidden="false"',
            helpUrl: "https://www.w3.org/WAI/WCAG21/quickref/#name-role-value",
            nodes: [
              {
                target: this.getElementSelector(element),
                html: element.outerHTML,
                failureSummary: `Invalid aria-hidden value: ${value}`,
              },
            ],
            tags: ["aria", "attributes"],
          });
        }
      });
    });

    return violations;
  }

  // Keyboard navigation checking
  private checkKeyboardNavigation(): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];

    // Check for focusable elements without visible focus indicators
    const focusableElements = document.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    focusableElements.forEach((element) => {
      const style = window.getComputedStyle(element);
      const hasFocusIndicator =
        style.outlineStyle !== "none" || element.hasAttribute("focus-visible");

      if (!hasFocusIndicator) {
        violations.push({
          rule: "focus-visible",
          description:
            "Element is focusable but has no visible focus indicator",
          impact: "moderate",
          level: "AA",
          help: "Add a visible focus indicator using CSS :focus or :focus-visible",
          helpUrl: "https://www.w3.org/WAI/WCAG21/quickref/#focus-visible",
          nodes: [
            {
              target: this.getElementSelector(element),
              html: element.outerHTML,
              failureSummary: "Missing visible focus indicator",
            },
          ],
          tags: ["keyboard", "focus"],
        });
      }
    });

    return violations;
  }

  // Link accessibility checking
  private checkLinkAccessibility(): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];

    const links = document.querySelectorAll("a");
    links.forEach((link) => {
      const href = link.getAttribute("href");
      const text = link.textContent?.trim();

      // Check for links with no href
      if (!href || href === "#") {
        violations.push({
          rule: "link-name",
          description: 'Link has no href attribute or points to "#"',
          impact: "serious",
          level: "A",
          help: "Add a valid href attribute or use a button instead",
          helpUrl:
            "https://www.w3.org/WAI/WCAG21/quickref/#link-purpose-in-context",
          nodes: [
            {
              target: this.getElementSelector(link),
              html: link.outerHTML,
              failureSummary: "Link missing valid href",
            },
          ],
          tags: ["link", "navigation"],
        });
      }

      // Check for generic link text
      if (
        text &&
        ["click here", "read more", "here", "link"].includes(text.toLowerCase())
      ) {
        violations.push({
          rule: "link-name",
          description: "Link text is not descriptive",
          impact: "moderate",
          level: "A",
          help: "Use descriptive link text that indicates the link destination",
          helpUrl:
            "https://www.w3.org/WAI/WCAG21/quickref/#link-purpose-in-context",
          nodes: [
            {
              target: this.getElementSelector(link),
              html: link.outerHTML,
              failureSummary: "Link text is not descriptive",
            },
          ],
          tags: ["link", "navigation"],
        });
      }
    });

    return violations;
  }

  // Table accessibility checking
  private checkTableAccessibility(): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];

    const tables = document.querySelectorAll("table");
    tables.forEach((table) => {
      // Check for table headers
      const thElements = table.querySelectorAll("th");
      const tdElements = table.querySelectorAll("td");

      if (tdElements.length > 0 && thElements.length === 0) {
        violations.push({
          rule: "table-headers",
          description: "Table has no headers",
          impact: "serious",
          level: "A",
          help: "Add <th> elements to table headers",
          helpUrl:
            "https://www.w3.org/WAI/WCAG21/quickref/#info-and-relationships",
          nodes: [
            {
              target: this.getElementSelector(table),
              html: table.outerHTML.substring(0, 200) + "...",
              failureSummary: "Table missing header cells",
            },
          ],
          tags: ["table", "headers"],
        });
      }

      // Check for table caption or summary
      const caption = table.querySelector("caption");
      const summary = table.getAttribute("summary");

      if (!caption && !summary) {
        violations.push({
          rule: "table-caption",
          description: "Table is missing a caption or summary",
          impact: "moderate",
          level: "A",
          help: "Add a <caption> element or summary attribute",
          helpUrl:
            "https://www.w3.org/WAI/WCAG21/quickref/#info-and-relationships",
          nodes: [
            {
              target: this.getElementSelector(table),
              html: table.outerHTML.substring(0, 200) + "...",
              failureSummary: "Table missing caption or summary",
            },
          ],
          tags: ["table", "caption"],
        });
      }
    });

    return violations;
  }

  // Language attributes checking
  private checkLanguageAttributes(): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];

    // Check document language
    const html = document.documentElement;
    const lang = html.getAttribute("lang");

    if (!lang) {
      violations.push({
        rule: "html-lang",
        description: "Document is missing language attribute",
        impact: "serious",
        level: "A",
        help: "Add lang attribute to html element",
        helpUrl: "https://www.w3.org/WAI/WCAG21/quickref/#language-of-page",
        nodes: [
          {
            target: "html",
            html: "<html>...</html>",
            failureSummary: "Missing lang attribute",
          },
        ],
        tags: ["language", "html"],
      });
    }

    return violations;
  }

  // Setup real-time monitoring
  private setupRealTimeMonitoring(): void {
    // Monitor DOM changes for accessibility violations
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.checkElementAccessibility(node as Element);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    this.observers.push(observer);
  }

  // Setup keyboard navigation monitoring
  private setupKeyboardNavigation(): void {
    document.addEventListener("keydown", (event) => {
      // Track Tab key usage for navigation testing
      if (event.key === "Tab") {
        // Could track focus movement here
      }
    });
  }

  // Setup focus management
  private setupFocusManagement(): void {
    document.addEventListener("focusin", (event) => {
      const target = event.target as Element;

      // Check if focused element is visible
      const rect = target.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        console.warn("Focused element is not visible:", target);
      }
    });
  }

  // Check element accessibility when added to DOM
  private checkElementAccessibility(element: Element): void {
    // Quick checks for newly added elements
    if (element.tagName === "IMG") {
      const alt = element.getAttribute("alt");
      if (!alt && !this.isDecorativeImage(element)) {
        console.warn("New image added without alt text:", element);
      }
    }
  }

  // Generate test result
  private generateTestResult(
    url: string,
    violations: AccessibilityViolation[],
  ): AccessibilityTestResult {
    const criticalCount = violations.filter(
      (v) => v.impact === "critical",
    ).length;
    const seriousCount = violations.filter(
      (v) => v.impact === "serious",
    ).length;
    const moderateCount = violations.filter(
      (v) => v.impact === "moderate",
    ).length;
    const minorCount = violations.filter((v) => v.impact === "minor").length;

    const totalViolations = violations.length;
    let score = 100;

    // Calculate score based on violations
    score -= criticalCount * 10;
    score -= seriousCount * 5;
    score -= moderateCount * 2;
    score -= minorCount * 1;

    score = Math.max(0, Math.min(100, score));

    // Determine compliance level
    let complianceLevel: "A" | "AA" | "AAA" | "Fail" = "Fail";
    if (criticalCount === 0 && seriousCount === 0 && moderateCount <= 2) {
      complianceLevel = "AA";
    } else if (criticalCount === 0 && seriousCount <= 1) {
      complianceLevel = "A";
    }

    const result: AccessibilityTestResult = {
      timestamp: Date.now(),
      url,
      violations,
      passes: 0, // Would need to implement passing rules
      incomplete: 0,
      inapplicable: 0,
      score,
      summary: {
        totalViolations,
        criticalViolations: criticalCount,
        seriousViolations: seriousCount,
        moderateViolations: moderateCount,
        minorViolations: minorCount,
        complianceLevel,
      },
      recommendations: this.generateAccessibilityRecommendations(violations),
    };

    return result;
  }

  // Generate accessibility recommendations
  private generateAccessibilityRecommendations(
    violations: AccessibilityViolation[],
  ): string[] {
    const recommendations: string[] = [];

    // Group violations by rule
    const ruleCounts: Record<string, number> = {};
    violations.forEach((v) => {
      ruleCounts[v.rule] = (ruleCounts[v.rule] || 0) + 1;
    });

    // Generate recommendations based on most common issues
    const topRules = Object.entries(ruleCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    topRules.forEach(([rule, count]) => {
      switch (rule) {
        case "image-alt":
          recommendations.push(
            `Fix ${count} image accessibility issues - ensure all meaningful images have descriptive alt text`,
          );
          break;
        case "color-contrast":
          recommendations.push(
            `Improve color contrast on ${count} elements - ensure 4.5:1 ratio for normal text`,
          );
          break;
        case "label":
          recommendations.push(
            `Add labels to ${count} form controls - use <label> or aria-label attributes`,
          );
          break;
        case "heading-order":
          recommendations.push(
            "Fix heading structure - ensure logical heading hierarchy (h1->h2->h3...)",
          );
          break;
        case "focus-visible":
          recommendations.push(
            `Add visible focus indicators to ${count} interactive elements`,
          );
          break;
        default:
          recommendations.push(`Address ${count} ${rule} violations`);
      }
    });

    // General recommendations
    if (violations.length > 10) {
      recommendations.push(
        "Consider conducting a comprehensive accessibility audit with automated tools",
      );
    }

    if (violations.some((v) => v.level === "AAA")) {
      recommendations.push(
        "Consider aiming for WCAG AAA compliance for enhanced accessibility",
      );
    }

    return recommendations;
  }

  // Utility methods
  private getElementSelector(element: Element): string {
    if (element.id) {
      return `#${element.id}`;
    }

    if (element.className) {
      return `${element.tagName.toLowerCase()}.${element.className.split(" ").join(".")}`;
    }

    // Generate a basic selector
    let selector = element.tagName.toLowerCase();
    let sibling = element.previousElementSibling;
    let nth = 1;

    while (sibling) {
      nth++;
      sibling = sibling.previousElementSibling;
    }

    if (nth > 1) {
      selector += `:nth-child(${nth})`;
    }

    return selector;
  }

  private getBackgroundColor(element: Element): string {
    let currentElement: Element | null = element;

    while (currentElement) {
      const style = window.getComputedStyle(currentElement);
      const backgroundColor = style.backgroundColor;

      if (
        backgroundColor !== "rgba(0, 0, 0, 0)" &&
        backgroundColor !== "transparent"
      ) {
        return backgroundColor;
      }

      currentElement = currentElement.parentElement;
    }

    return "rgb(255, 255, 255)"; // Default white background
  }

  private calculateColorContrast(
    foreground: string,
    background: string,
  ): number {
    // Simple contrast calculation (would need more sophisticated implementation)
    // This is a placeholder - real implementation would use proper color math
    return 4.5; // Placeholder value
  }

  private isDecorativeImage(img: Element): boolean {
    const alt = img.getAttribute("alt");
    const role = img.getAttribute("role");
    const ariaHidden = img.getAttribute("aria-hidden");

    // Images with empty alt, role="presentation", or aria-hidden are decorative
    return alt === "" || role === "presentation" || ariaHidden === "true";
  }

  // Public API methods
  getLatestResult(): AccessibilityTestResult | null {
    return this.results[this.results.length - 1] || null;
  }

  getAllResults(): AccessibilityTestResult[] {
    return [...this.results];
  }

  getComplianceScore(): number {
    const latest = this.getLatestResult();
    return latest ? latest.score : 0;
  }

  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  clearResults(): void {
    this.results = [];
  }
}

// React hook for accessibility testing
export function useAccessibilityTesting(config?: Partial<AccessibilityConfig>) {
  const [results, setResults] = React.useState<AccessibilityTestResult[]>([]);
  const testerRef = React.useRef<AccessibilityTester | null>(null);

  React.useEffect(() => {
    if (!testerRef.current) {
      testerRef.current = new AccessibilityTester(config);
      testerRef.current.startMonitoring().catch(console.error);
    }

    return () => {
      if (testerRef.current) {
        testerRef.current.stopMonitoring();
      }
    };
  }, []);

  const runTest = React.useCallback(async (url?: string) => {
    if (testerRef.current) {
      const result = await testerRef.current.runAccessibilityTest(url);
      setResults((prev) => [...prev.slice(-9), result]); // Keep last 10 results
      return result;
    }
    return null;
  }, []);

  const complianceScore = React.useMemo(() => {
    return testerRef.current?.getComplianceScore() || 0;
  }, [results]); // Recalculate when results change

  const isMonitoringActive = React.useMemo(() => {
    return testerRef.current?.isMonitoringActive() || false;
  }, []); // Only calculate once on mount

  return {
    runTest,
    results,
    latestResult: results[results.length - 1] || null,
    complianceScore,
    isMonitoringActive,
  };
}

// Utility functions for accessibility
export const AccessibilityUtils = {
  // Generate accessible color combinations
  getAccessibleColorCombos: (baseColor: string) => {
    // Placeholder - would return accessible color combinations
    return {
      light: "#ffffff",
      dark: "#000000",
      accessible: ["#0066cc", "#004499", "#002266"],
    };
  },

  // Check if text is readable
  isTextReadable: (
    text: string,
    fontSize: number,
    fontWeight: number,
  ): boolean => {
    // Basic readability check
    return text.length > 0 && fontSize >= 14;
  },

  // Generate ARIA labels
  generateAriaLabel: (element: Element, context: string): string => {
    // Generate descriptive label based on element and context
    return `${element.tagName.toLowerCase()} ${context}`;
  },

  // Check keyboard accessibility
  isKeyboardAccessible: (element: Element): boolean => {
    const tabIndex = element.getAttribute("tabindex");
    const disabled = element.hasAttribute("disabled");

    if (disabled) return false;
    if (tabIndex === "-1") return false;

    // Check if element is naturally focusable
    const naturallyFocusable = [
      "A",
      "BUTTON",
      "INPUT",
      "SELECT",
      "TEXTAREA",
    ].includes(element.tagName);

    return naturallyFocusable || (tabIndex !== null && parseInt(tabIndex) >= 0);
  },
};

// Validation schemas for accessibility configuration
export const accessibilitySchemas = {
  config: z.object({
    enableAutomatedTesting: z.boolean(),
    enableRealTimeChecking: z.boolean(),
    enableKeyboardNavigation: z.boolean(),
    enableScreenReader: z.boolean(),
    enableColorContrast: z.boolean(),
    enableFocusManagement: z.boolean(),
    testFrequency: z.enum(["continuous", "on-demand", "scheduled"]),
    complianceLevel: z.enum(["A", "AA", "AAA"]),
    customRules: z.record(z.string(), z.unknown()),
    excludePatterns: z.array(z.string()),
    includePatterns: z.array(z.string()),
  }),

  violation: z.object({
    rule: z.string(),
    description: z.string(),
    impact: z.enum(["minor", "moderate", "serious", "critical"]),
    level: z.enum(["A", "AA", "AAA"]),
    help: z.string(),
    helpUrl: z.string(),
    nodes: z.array(
      z.object({
        target: z.string(),
        html: z.string(),
        failureSummary: z.string(),
      }),
    ),
    tags: z.array(z.string()),
  }),
};

// Import React for JSX
import React from "react";
