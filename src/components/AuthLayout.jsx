import React from "react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-neon-blue/5" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-blue/5 rounded-full blur-3xl" />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold bg-gradient-to-r from-primary via-neon-blue to-gold bg-clip-text text-transparent mb-1">
            Millennium
          </h1>
          <p className="text-xs text-muted-foreground font-body tracking-widest uppercase">Collection</p>
          <h2 className="text-xl font-body font-semibold text-foreground mt-6">{title}</h2>
          {subtitle && <p className="text-muted-foreground text-sm mt-1 font-body">{subtitle}</p>}
        </div>
        <div className="glass rounded-2xl p-8 glow-purple">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6 font-body">{footer}</p>
        )}
      </div>
    </div>
  );
}