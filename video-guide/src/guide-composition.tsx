// Main Remotion composition assembling the 5 user-guide scenes with <Series> and premounted sequences.
import React from 'react';
import { AbsoluteFill, interpolate, Series, useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneCopilotQaqc } from './scenes/scene-copilot-qaqc';
import { SceneIntroStudio } from './scenes/scene-intro-studio';
import { ScenePersonasLabs } from './scenes/scene-personas-labs';
import { SceneProblemSolving } from './scenes/scene-problem-solving';
import { SceneWhiteboxSvg } from './scenes/scene-whitebox-svg';
import { type GuideCompositionProps, VIDEO_TOKENS } from './theme-tokens';

export const Ai4UCheEGuideComposition: React.FC<GuideCompositionProps> = ({ bilingualSubtitles }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const sceneFrames = 3 * fps; // 90 frames (3 seconds) per scene -> 450 frames (15 seconds total @ 30fps)

  const progressPct = interpolate(frame, [0, durationInFrames - 1], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: VIDEO_TOKENS.ivory }}>
      <Series>
        <Series.Sequence durationInFrames={sceneFrames} premountFor={fps}>
          <SceneIntroStudio bilingualSubtitles={bilingualSubtitles} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={sceneFrames} premountFor={fps}>
          <ScenePersonasLabs bilingualSubtitles={bilingualSubtitles} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={sceneFrames} premountFor={fps}>
          <SceneProblemSolving bilingualSubtitles={bilingualSubtitles} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={sceneFrames} premountFor={fps}>
          <SceneWhiteboxSvg bilingualSubtitles={bilingualSubtitles} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={sceneFrames} premountFor={fps}>
          <SceneCopilotQaqc bilingualSubtitles={bilingualSubtitles} />
        </Series.Sequence>
      </Series>

      {/* Global Timeline Progress Bar at bottom edge */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 8,
          backgroundColor: 'rgba(7, 26, 51, 0.18)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressPct}%`,
            backgroundColor: VIDEO_TOKENS.maize,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
