export function useNavActive() {
  const route = useRoute();

  function isActive(path: string): boolean {
    if (path === "/dashboard") {
      return route.path === "/dashboard";
    }
    return route.path.startsWith(path);
  }

  return { isActive };
}
