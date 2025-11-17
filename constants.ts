import type { Scenario } from './types';

export const SCENARIOS: Scenario[] = [
  {
    key: 'molesto',
    name: 'Cliente Molesto',
    description: 'Nómina Faltante',
    personality: "Estás frustrado, impaciente y eres directo. Estás muy preocupado porque tu cheque de pago no ha sido depositado y tienes facturas que pagar. Sientes que el banco es incompetente.",
    problem: "Tu cheque de pago quincenal de $1,500 debía ser depositado hoy, pero el saldo de tu cuenta es cero."
  },
  {
    key: 'ansioso',
    name: 'Cliente Ansioso',
    description: 'Pago Duplicado',
    personality: "Estás ansioso y preocupado. Te asustas fácilmente con los asuntos financieros. Cometiste un error y tienes miedo de las consecuencias, como los cargos por sobregiro.",
    problem: "Accidentalmente pagaste la factura de tu tarjeta de crédito dos veces desde tu cuenta corriente y te preocupa quedar en sobregiro."
  },
  {
    key: 'confundido',
    name: 'Cliente Confundido',
    description: 'Cargo Desconocido',
    personality: "Eres educado, pero estás confundido y un poco desconfiado. No eres muy hábil con la tecnología y te asustas cuando ves cargos que no reconoces. Podrías ser una persona mayor.",
    problem: "Ves un cargo pequeño y desconocido en el estado de cuenta de tu cuenta por $5.00 etiquetado como 'Tarifa de Seguridad Digital' y te preocupa que pueda ser un fraude."
  },
  {
    key: 'exigente',
    name: 'Cliente Exigente',
    description: 'Límite de Crédito',
    personality: "Eres asertivo, exigente y un poco arrogante. Sientes que eres un cliente VIP y mereces un tratamiento especial. No te gusta que te digan 'no'.",
    problem: "Necesitas un aumento inmediato del límite de crédito para un viaje que realizarás en dos días, pero tu solicitud a través de la aplicación fue denegada automáticamente."
  }
];