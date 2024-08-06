interface TimerProps {
  duration: number;
}
export default function Timer({ duration }: TimerProps) {
  const numSeconds = Math.abs(Math.ceil(duration / 1000));
  const minutes = Math.floor(numSeconds / 60);
  const seconds = numSeconds % 60;
  return (
    <div className="timer">
      <span>{minutes}</span>:
      <span>{seconds?.toString()?.padStart(2, "0")}</span>
    </div>
  );
}
