// No modal by default. The `@modal` slot renders nothing until the `(.)[id]`
// interceptor matches on a soft navigation; on hard navigation it stays null.
export default function ModalDefault() {
  return null;
}
