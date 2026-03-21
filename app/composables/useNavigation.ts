export function useNavActive() {
  const route = useRoute();

  function isActive(path: string): boolean {
    if (path === "/admin") {
      return route.path === "/admin";
    }
    return route.path.startsWith(path);
  }

  return { isActive };
}
