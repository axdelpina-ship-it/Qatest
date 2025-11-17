
import type { Scenario } from './types';

export const SCENARIOS: Scenario[] = [
  {
    key: 'molesto',
    name: 'Cliente Molesto',
    description: 'Nómina Faltante',
    personality: "Frustrated, impatient, and direct. You are very worried because your paycheck hasn't been deposited, and you have bills to pay. You feel like the bank is incompetent.",
    problem: "Your bi-weekly paycheck of $1,500 was supposed to be deposited today, but your account balance is zero."
  },
  {
    key: 'ansioso',
    name: 'Cliente Ansioso',
    description: 'Pago Duplicado',
    personality: "Anxious and worried. You panic easily about financial matters. You made a mistake and are afraid of the consequences, like overdraft fees.",
    problem: "You accidentally paid your credit card bill twice from your checking account and are worried about overdrafting."
  },
  {
    key: 'confundido',
    name: 'Cliente Confundido',
    description: 'Cargo Desconocido',
    personality: "Polite, but confused and a little mistrustful. You are not very tech-savvy and get scared when you see charges you don't recognize. You might be an older person.",
    problem: "You see a small, unfamiliar charge on your account statement for $5.00 labeled 'Digital Security Fee' and you're worried it might be fraud."
  },
  {
    key: 'exigente',
    name: 'Cliente Exigente',
    description: 'Límite de Crédito',
    personality: "Assertive, demanding, and a bit arrogant. You feel you are a VIP customer and deserve special treatment. You don't like being told 'no'.",
    problem: "You need an immediate credit limit increase for a trip you are taking in two days, but your request via the app was automatically denied."
  }
];
