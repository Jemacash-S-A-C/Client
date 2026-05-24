import step1 from "../assets/steps_main_page/step1.png";
import step2 from "../assets/steps_main_page/step2.png";
import step3 from "../assets/steps_main_page/step3.png";

export type WorkflowStep = {
  step: string;
  title: string;
  text: string;
  img_route: string;
};

export const workflowSteps: WorkflowStep[] = [
  {
    step: "1",
    title: "Scan",
    text: "Escanea tu identificación y el artículo que deseas valuar usando nuestra app intuitiva. Nuestra IA reconoce miles de modelos al instante.",
    img_route: step1,
  },
  {
    step: "2",
    title: "Verify",
    text: "Validamos la condición de tu equipo y tu identidad en tiempo real. Recibe una oferta competitiva basada en el valor de mercado actual.",
    img_route: step2,
  },
  {
    step: "3",
    title: "Get Paid",
    text: "Una vez aceptada la oferta, el dinero se transfiere directamente a tu cuenta bancaria o billetera digital en cuestión de minutos.",
    img_route: step3,
  },
];
