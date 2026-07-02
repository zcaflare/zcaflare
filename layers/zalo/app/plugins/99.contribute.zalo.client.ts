export default defineNuxtPlugin(() => {
  const { contribute } = useLayerRegistry()
  contribute({
    navItems: [
      { id: 'home', label: 'Home', icon: 'i-lucide-house', to: '/', section: 'main', priority: 0 },
    ],
  })
})
