import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import type { Navigate } from "../../navigation";

type InternalLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> & {
  children: ReactNode;
  href: string;
  navigate: Navigate;
};

function InternalLink({ children, href, navigate, ...props }: InternalLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    navigate(href);
  }

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

export default InternalLink;
