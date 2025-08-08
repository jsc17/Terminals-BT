import { k, f } from "./chunks/event-state.js";
import { c, r } from "./chunks/query.js";
import { q } from "./chunks/query.js";
import { f as f2 } from "./chunks/form.js";
import { p } from "./chunks/prerender.js";
// @__NO_SIDE_EFFECTS__
function command(validate_or_fn, maybe_fn) {
  const fn = maybe_fn ?? validate_or_fn;
  const validate = c(validate_or_fn, maybe_fn);
  const __ = { type: "command", id: "", name: "" };
  const wrapper = (arg) => {
    var _a;
    const event = k();
    if (!event.isRemoteRequest) {
      throw new Error(
        `Cannot call a command (\`${__.name}(${maybe_fn ? "..." : ""})\`) during server-side rendering`
      );
    }
    (_a = f(event)).refreshes ?? (_a.refreshes = {});
    const promise = Promise.resolve(r(event, true, arg, validate, fn));
    promise.updates = () => {
      throw new Error(`Cannot call '${__.name}(...).updates(...)' on the server`);
    };
    return (
      /** @type {ReturnType<RemoteCommand<Input, Output>>} */
      promise
    );
  };
  Object.defineProperty(wrapper, "__", { value: __ });
  return wrapper;
}
export {
  command,
  f2 as form,
  p as prerender,
  q as query
};
