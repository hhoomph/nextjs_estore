import "@testing-library/jest-dom/vitest";

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const TestIcon = () => <span aria-hidden="true">icon</span>;

describe("component snapshots", () => {
  it("matches the default button snapshot", () => {
    const { container } = render(
      <Button variant="secondary" size="sm" leftIcon={<TestIcon />}>
        Add to cart
      </Button>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("matches the loading button snapshot", () => {
    const { container } = render(
      <Button loading size="lg">
        Saving
      </Button>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("matches the input snapshot with icons", () => {
    const { container } = render(
      <Input
        placeholder="Search products"
        leftIcon={<TestIcon />}
        rightIcon={<TestIcon />}
      />,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("matches the card layout snapshot", () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Featured product</CardTitle>
          <CardDescription>Snapshot-stable card content</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Product summary</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline">View details</Button>
        </CardFooter>
      </Card>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("matches badge variant snapshots", () => {
    const { container } = render(
      <div aria-label="badge variants">
        <Badge variant="default">New</Badge>
        <Badge variant="secondary">Featured</Badge>
        <Badge variant="destructive">Sold out</Badge>
        <Badge variant="outline">In stock</Badge>
      </div>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
