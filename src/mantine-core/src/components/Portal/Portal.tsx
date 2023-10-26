/* eslint-disable react/no-unused-prop-types */
import React, { useRef, useState, forwardRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useIsomorphicEffect, assignRef } from '@mantine/hooks';
import { Timeout } from 'react-number-format/types/types';
import { useProps } from '../../core';

function createPortalNode(props: React.ComponentPropsWithoutRef<'div'>) {
  const node = document.createElement('div');
  node.setAttribute('data-portal', 'true');
  typeof props.className === 'string' && node.classList.add(...props.className.split(' '));
  typeof props.style === 'object' && Object.assign(node.style, props.style);
  typeof props.id === 'string' && node.setAttribute('id', props.id);
  return node;
}

export interface PortalProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Portal children, for example, custom modal or popover */
  children: React.ReactNode;

  /** Element inside which portal should be created, by default a new div element is created and appended to the `document.body` */
  target?: HTMLElement | string;

  /** Render Portal content. */
  mounted?: boolean;

  /** Delay until the Portal is unmounted. Used to allow transitions to finish before unmounting. */
  unmountDelay?: number;
}

const defaultProps: Partial<PortalProps> = {
  mounted: true,
};

export const Portal = forwardRef<HTMLDivElement, PortalProps>((props, ref) => {
  const { children, mounted, unmountDelay, target, ...others } = useProps('Portal', defaultProps, props);

  const [targetMounted, setTargetMounted] = useState(false);
  const unmountTimeout = useRef<Timeout | null>(null);
  const nodeRef = useRef<HTMLElement | null>(null);

  useEffect(() => () => {
    if (unmountTimeout.current) {
      if (!target && nodeRef.current && nodeRef.current !== document.body) {
        document.body.removeChild(nodeRef.current);
      }
      clearTimeout(unmountTimeout.current);
    }
  }, []);

  useIsomorphicEffect(() => {
    if (!mounted) {
      unmountTimeout.current = setTimeout(() => {
        if (!target && nodeRef.current && nodeRef.current !== document.body) {
           document.body.removeChild(nodeRef.current);
        }
        setTargetMounted(false);
      }, unmountDelay);
      return;
    }
    if (unmountTimeout.current) {
      clearTimeout(unmountTimeout.current);
    }
    setTargetMounted(true);

    const getNode = () => {
      if (others.className || others.style || others.id) {
        return createPortalNode(others);
      }
      return document.body;
    };

    nodeRef.current = !target
      ? getNode()
      : typeof target === 'string'
      ? document.querySelector(target)
      : target;

    assignRef(ref, nodeRef.current);

    if (!target && nodeRef.current && nodeRef.current !== document.body) {
      document.body.appendChild(nodeRef.current);
    }
  }, [target, mounted]);

  if (!targetMounted || !nodeRef.current) {
    return null;
  }

  return createPortal(<>{children}</>, nodeRef.current);
});

Portal.displayName = '@mantine/core/Portal';
