function installMethods(target, methods) {
  for (const [name, value] of Object.entries(methods)) {
    Object.defineProperty(value, "name", { value: name, configurable: true });
    Object.defineProperty(target, name, { value, writable: true, configurable: true });
  }
}

export { installMethods };
