import { type SVGProps } from "react";

import { type IconName } from "~/components/icons/names.ts";
import spriteHref from "~/components/icons/sprite.svg";

export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & {
  name: IconName;
}) {
  return (
    <svg {...props}>
      <use href={`${spriteHref}#${name}`} />
    </svg>
  );
}
