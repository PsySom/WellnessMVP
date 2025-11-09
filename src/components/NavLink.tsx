import { Link, LinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavLinkProps extends LinkProps {
  activeClassName?: string;
}

export const NavLink = ({ 
  className, 
  activeClassName = 'active',
  ...props 
}: NavLinkProps) => {
  return (
    <Link 
      className={cn(className)} 
      {...props} 
    />
  );
};
