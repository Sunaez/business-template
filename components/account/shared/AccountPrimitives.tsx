"use client";
import { ArrowUpRight } from "lucide-react";
import { type ReactNode } from "react";
export function Status({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "attention";
}) {
  return (
    <span className={`account-status account-status--${tone}`}>
      <span aria-hidden="true" />
      {children}
    </span>
  );
}
export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="account-section-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
export function TextButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button className="account-text-button" type="button" onClick={onClick}>
      {children}
      <ArrowUpRight size={14} aria-hidden="true" />
    </button>
  );
}
export function Metrics({
  items,
}: {
  items: {
    label: string;
    value: string | number;
    note: string;
    onClick?: () => void;
  }[];
}) {
  return (
    <div className="account-metrics" data-count={items.length}>
      {items.map((item) => (
        <div className="account-metric" key={item.label}>
          <span className="eyebrow">{item.label}</span>
          <strong>{item.value}</strong>
          {item.onClick ? (
            <button type="button" onClick={item.onClick}>
              {item.note}
              <ArrowUpRight size={13} aria-hidden="true" />
            </button>
          ) : (
            <span>{item.note}</span>
          )}
        </div>
      ))}
    </div>
  );
}
export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="account-empty">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
