export function useRuntimeConfig() {
  return {
    bounceServerUrl: 'https://zca.thecodeorigin.com',
    authSecret: 'test-secret',
  } as Record<string, string>
}
