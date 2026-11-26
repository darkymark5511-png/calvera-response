import { ROSTER, SQUAD_SIZE, type Operator } from "@/shared/roster";

/** Radial command wheel: eight orders, spoken with the roster callsigns. */

export type CommandId =
  | "move-up"
  | "cover-me"
  | "stack-up"
  | "breach"
  | "hold"
  | "flash-out"
  | "hold-fire"
  | "search";

export interface CommandDefinition {
  id: CommandId;
  labelKey: string;
  /** Radio confirmation the operator says back. */
  ackKey: string;
  requiresRadio: boolean;
  /** Some orders only make sense for a role. */
  preferredRoles: readonly Operator["role"][];
}

export const COMMANDS: readonly CommandDefinition[] = [
  {
    id: "move-up",
    labelKey: "cmd.moveUp",
    ackKey: "cmd.moveUp.ack",
    requiresRadio: false,
    preferredRoles: ["point-man", "scout"],
  },
  {
    id: "cover-me",
    labelKey: "cmd.coverMe",
    ackKey: "cmd.coverMe.ack",
    requiresRadio: false,
    preferredRoles: ["support-gunner", "marksman"],
  },
  {
    id: "stack-up",
    labelKey: "cmd.stackUp",
    ackKey: "cmd.stackUp.ack",
    requiresRadio: false,
    preferredRoles: ["point-man", "breacher"],
  },
  {
    id: "breach",
    labelKey: "cmd.breach",
    ackKey: "cmd.breach.ack",
    requiresRadio: false,
    preferredRoles: ["breacher", "technician"],
  },
  {
    id: "hold",
    labelKey: "cmd.hold",
    ackKey: "cmd.hold.ack",
    requiresRadio: false,
    preferredRoles: [],
  },
  {
    id: "flash-out",
    labelKey: "cmd.flashOut",
    ackKey: "cmd.flashOut.ack",
    requiresRadio: false,
    preferredRoles: ["breacher", "point-man"],
  },
  {
    id: "hold-fire",
    labelKey: "cmd.holdFire",
    ackKey: "cmd.holdFire.ack",
    requiresRadio: true,
    preferredRoles: [],
  },
  {
    id: "search",
    labelKey: "cmd.search",
    ackKey: "cmd.search.ack",
    requiresRadio: false,
    preferredRoles: ["scout", "technician"],
  },
] as const;

export interface CommandOrder {
  commandId: CommandId;
  targetCallsign: string;
  issuedAtSeconds: number;
  /** The earpiece radio is required for the quieter orders to be confirmed. */
  radioAvailable: boolean;
}

export interface Acknowledgement {
  callsign: string;
  commandId: CommandId;
  ackKey: string;
  confirmed: boolean;
  /** Why a command was refused, when it was. */
  refusalKey: string | null;
}

/**
 * Resolves who acknowledges an order. The squad is at most three operators and
 * every callsign must exist in the roster — there are no temporary callsigns.
 */
export function resolveAcknowledgement(
  order: CommandOrder,
  squadIds: readonly string[],
): Acknowledgement {
  const command = COMMANDS.find((entry) => entry.id === order.commandId);
  const squad = squadIds
    .map((id) => ROSTER.find((operator) => operator.id === id))
    .filter((operator): operator is Operator => operator !== undefined)
    .slice(0, SQUAD_SIZE);

  const target =
    squad.find((operator) => operator.callsign === order.targetCallsign) ?? squad[0];

  if (!command || !target) {
    return {
      callsign: order.targetCallsign,
      commandId: order.commandId,
      ackKey: "cmd.ack.none",
      confirmed: false,
      refusalKey: "cmd.refusal.noSquad",
    };
  }

  if (command.requiresRadio && !order.radioAvailable) {
    return {
      callsign: target.callsign,
      commandId: order.commandId,
      ackKey: command.ackKey,
      confirmed: false,
      refusalKey: "cmd.refusal.noRadio",
    };
  }

  return {
    callsign: target.callsign,
    commandId: order.commandId,
    ackKey: command.ackKey,
    confirmed: true,
    refusalKey: null,
  };
}

/** Picks the operator best suited to an order, used to pre-highlight the wheel. */
export function preferredOperator(
  commandId: CommandId,
  squadIds: readonly string[],
): Operator | undefined {
  const command = COMMANDS.find((entry) => entry.id === commandId);
  const squad = squadIds
    .map((id) => ROSTER.find((operator) => operator.id === id))
    .filter((operator): operator is Operator => operator !== undefined);

  if (!command) return squad[0];
  const match = squad.find((operator) => command.preferredRoles.includes(operator.role));
  return match ?? squad[0];
}
