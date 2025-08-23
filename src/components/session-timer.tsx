'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SessionTimerProps {
  onSessionComplete?: (durationMins: number, kind: string, notes?: string) => void;
  linkedItemId?: number;
  linkedItemType?: 'plan' | 'problem' | 'oop_problem';
}

export function SessionTimer({ onSessionComplete, linkedItemId, linkedItemType }: SessionTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [sessionKind, setSessionKind] = useState<string>('study');
  const [notes, setNotes] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sessionKinds = ['study', 'drill', 'build', 'eval', 'mock', 'challenge'];

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = () => {
    setIsRunning(false);
    const durationMins = Math.ceil(seconds / 60);
    
    if (seconds > 0 && onSessionComplete) {
      onSessionComplete(durationMins, sessionKind, notes);
    }
    
    setSeconds(0);
    setNotes('');
  };

  // const resetTimer = () => {
  //   setIsRunning(false);
  //   setSeconds(0);
  //   setNotes('');
  // };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Session Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-mono font-bold">
            {formatTime(seconds)}
          </div>
          <div className="mt-2">
            <Badge variant="outline" className="text-sm">
              {sessionKind}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {sessionKinds.map((kind) => (
            <Button
              key={kind}
              variant={sessionKind === kind ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSessionKind(kind)}
              disabled={isRunning}
              className="text-xs capitalize"
            >
              {kind}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          {!isRunning ? (
            <Button onClick={startTimer} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          ) : (
            <Button onClick={pauseTimer} variant="outline" className="flex-1">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          
          <Button 
            onClick={stopTimer} 
            variant="destructive" 
            disabled={seconds === 0}
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>

        {seconds > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Session Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you work on?"
              className="w-full p-2 text-sm border rounded-md resize-none"
              rows={2}
            />
          </div>
        )}

        {linkedItemId && (
          <div className="text-xs text-muted-foreground">
            Linked to {linkedItemType} #{linkedItemId}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

