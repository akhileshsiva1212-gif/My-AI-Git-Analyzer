// Neumorphic pressable button. `variant="accent"` is the indigo CTA;
// default is the soft neutral button. Works as a real <button>.
export default function Button({
  variant = 'neutral',
  className = '',
  children,
  ...props
}) {
  const base = variant === 'accent' ? 'neu-accent' : 'neu-btn'
  return (
    <button
      className={`${base} px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
