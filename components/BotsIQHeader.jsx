import React from 'react';
import Image from 'next/image';

export default function BotsIQHeader(props) {
  return (
    <div className="flex items-center">
      <Image src="/logo.png" alt="Main logo" width="80" height="80" />
      <h1 className="text-bots-orange font-robotomono text-4xl bold">
        BotsIQ Cobot Challenge Interface
      </h1>
    </div>
  );
}
