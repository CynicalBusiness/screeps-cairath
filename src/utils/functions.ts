import { OperatorFunction } from "rxjs";
import { filter } from "rxjs/operators";

/**
 * Observable pipeline function for filtering events of a given type
 * @param type The type of event to filter
 */
export function ofType<TEvent extends Event.Type.Any>(
    type: TEvent["type"]
): OperatorFunction<Event.Type.Any, TEvent> {
    return filter((event): event is TEvent => event.type === type);
}
