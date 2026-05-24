import { formatPenSoles } from "../../utils/formatPenSoles";
import styles from "./LoanCalculator.module.css";

type LoanCalculatorProps = {
  amountNeeded: string;
  onAmountNeededChange: (value: string) => void;
  weeklyPayment: string;
  onWeeklyPaymentChange: (value: string) => void;
  weeksTerm: string;
  onWeeksTermChange: (value: string) => void;
};

export function LoanCalculator({
  amountNeeded,
  onAmountNeededChange,
  weeklyPayment,
  onWeeklyPaymentChange,
  weeksTerm,
  onWeeksTermChange,
}: LoanCalculatorProps) {
  const loanFormatted = formatPenSoles(amountNeeded);
  const weeklyFormatted = formatPenSoles(weeklyPayment);
  const weeksNum = Number(weeksTerm);
  const weeksLabel =
    Number.isFinite(weeksNum) && weeksNum > 0
      ? `${weeksNum} ${weeksNum === 1 ? "semana" : "semanas"}`
      : "";

  return (
    <article className={styles.calculator} aria-label="Calculadora de préstamo">
      <h2>Calcula tu préstamo</h2>

      <div className={styles.calc_request_block}>
        <label className={styles.calc_label} htmlFor="loan-amount-input">
          Monto del préstamo que solicitas
        </label>
        <p className={styles.calc_hint} id="loan-amount-hint">
          Escribe cuánto dinero necesitas; revisa el rango permitido abajo.
        </p>
        <div className={styles.calc_amount_field_wrap}>
          <div className={styles.calc_amount_field}>
            <span className={styles.money_prefix}>S/</span>
            <input
              id="loan-amount-input"
              type="number"
              min="15000"
              max="2000000"
              step="100"
              inputMode="numeric"
              value={amountNeeded}
              onChange={(event) => onAmountNeededChange(event.target.value)}
              aria-describedby="loan-amount-hint amount-range-hint"
              placeholder="Ej. 17000"
            />
            <span className={styles.money_divider} aria-hidden="true" />
            <span className={styles.money_suffix}>PEN</span>
          </div>
        </div>
      </div>

      <div className={styles.amount_meta} id="amount-range-hint">
        <span>Mínimo S/15,000</span>
        <span>Máximo S/2,000,000</span>
      </div>

      <p className={styles.interest_copy}>
        Tasa de interés mensual desde <strong>1.05%</strong>
      </p>

      <div className={styles.calc_grid}>
        <div>
          <small>PAGO SEMANAL</small>
          <label className={styles.currency_input} aria-label="Pago semanal">
            <span>S/</span>
            <input
              type="number"
              min="0"
              step="10"
              inputMode="numeric"
              value={weeklyPayment}
              onChange={(event) => onWeeklyPaymentChange(event.target.value)}
            />
          </label>
        </div>
        <div>
          <small>SEMANAS</small>
          <label className={styles.term_input} aria-label="Semanas de plazo">
            <input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={weeksTerm}
              onChange={(event) => onWeeksTermChange(event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className={styles.calc_recap} role="status" aria-live="polite">
        <span className={styles.calc_recap_label}>Tu solicitud</span>
        <p className={styles.calc_recap_main}>
          {loanFormatted ? (
            <>
              Préstamo solicitado: <strong>{loanFormatted}</strong>
            </>
          ) : (
            <span className={styles.calc_recap_muted}>
              Ingresa el monto del préstamo que deseas.
            </span>
          )}
        </p>
        {(weeklyFormatted || weeksLabel) && (
          <p className={styles.calc_recap_sub}>
            {weeklyFormatted && (
              <>
                Pago semanal: <strong>{weeklyFormatted}</strong>
              </>
            )}
            {weeklyFormatted && weeksLabel && " · "}
            {weeksLabel && (
              <>
                Plazo: <strong>{weeksLabel}</strong>
              </>
            )}
          </p>
        )}
      </div>

      <button type="button" className={styles.calculator_button}>
        Iniciar solicitud ahora
      </button>
    </article>
  );
}
