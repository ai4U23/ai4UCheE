// Remotion Root defining the Ai4UCheEGuide video composition (1920x1080, 30fps, 450 frames) and Poster Still.
import React from 'react';
import { Composition, Folder, Still } from 'remotion';
import { Ai4UCheEGuideComposition } from './guide-composition';
import { SceneIntroStudio } from './scenes/scene-intro-studio';
import type { GuideCompositionProps } from './theme-tokens';

const defaultGuideProps: GuideCompositionProps = {
  title: "ai4UCheE — ChemEng's Intelligent Workbench",
  subtitle: '6-Book ChE Solver · 55+ Interactive SVG Charts · 24 Real-Life Plant Problems',
  siteUrl: 'https://chemeng.ai4u.now',
  bilingualSubtitles: false,
};

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="Onboarding-Guide">
      <Composition
        id="Ai4UCheEGuide"
        component={Ai4UCheEGuideComposition}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultGuideProps satisfies GuideCompositionProps}
      />
      <Still
        id="Ai4UCheEGuidePoster"
        component={() => <SceneIntroStudio bilingualSubtitles={false} />}
        width={1920}
        height={1080}
      />
    </Folder>
  );
};
