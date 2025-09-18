export function ScoreProgress() {
  const currentScore = 5200
  const nextLevelScore = 8000
  const progress = (currentScore / nextLevelScore) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-sm">
              2
            </div>
            <span className="font-semibold">Level 2</span>
          </div>
          <p className="text-sm text-muted-foreground">{nextLevelScore - currentScore} points to next level</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{currentScore}</div>
          <div className="text-sm text-muted-foreground">Total Points</div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
          2
        </div>
        <div className="flex-1 bg-muted rounded-full h-3">
          <div
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-bold text-sm">
          3
        </div>
      </div>

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{currentScore}</span>
        <span>{nextLevelScore}</span>
      </div>
    </div>
  )
}
