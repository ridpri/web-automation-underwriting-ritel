export function cls(...classes) {
  return classes.filter(Boolean).join(" ");
}
