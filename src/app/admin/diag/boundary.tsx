"use client";
import { Component, type ReactNode } from "react";
// DIAGNÓSTICO TEMPORAL (no se sube): atrapa el fallo de cada pedazo por separado.
export class Boundary extends Component<{ name: string; children: ReactNode }, { err: string | null }> {
  state = { err: null as string | null };
  static getDerivedStateFromError(e: unknown) {
    const x = e as { message?: string; digest?: string };
    return { err: `${x?.message ?? String(e)} · digest ${x?.digest ?? "-"}` };
  }
  render() {
    return (
      <div data-diag={this.props.name} style={{ border: "1px solid #ccc", margin: 6, padding: 6 }}>
        <b>{this.props.name}:</b> {this.state.err ? <span style={{ color: "crimson" }}>FALLA {this.state.err}</span> : this.props.children}
      </div>
    );
  }
}
