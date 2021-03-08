import React, { PropsWithChildren } from "react";
import ReactMarkdown from "react-markdown";
import Clink from "./markdown/Clink";
import CodeBlock from "./markdown/CodeBlock";
import InlineCode from "./markdown/InlineCode";
import Table from "./markdown/Table";
import TableCell from "./markdown/TableCell";
import Heading from "./markdown/Heading";
import { ContentProps } from "../utils/Interfaces";
import directive from 'remark-directive'
// @ts-ignore
import normalizeHeadings from 'remark-normalize-headings';
import gfm from 'remark-gfm';
import Question from "./markdown/custom/Question";
import Answer from "./markdown/custom/Answer";
import RequiredMod from "./markdown/custom/RequiredMod";
import Group from "./markdown/custom/Group";
// @ts-ignore
import slug from 'remark-slug';
// @ts-ignore
import GithubSlugger from 'github-slugger';

const directives: any = {
  question: (props: PropsWithChildren<any>, custom: any) => {
    return <Question props = {props}/>
  },
  answer: (props: PropsWithChildren<any>, custom: any) => {
    return <Answer props = {props}/>
  },
  requiredMod: (props: PropsWithChildren<any>, custom: any) => {
    return <RequiredMod props = {props}/>
  },
  group: (props: PropsWithChildren<any>, custom: any) => {
    return <Group props = {props} custom={custom}/>;
  }
}

export default function Content({ version, lang, page }: ContentProps) {

  const slugger = new GithubSlugger()

  function transform(url: string, image: boolean) {
    if (!url) {
      return ``;
    }
    if (url.startsWith("http")) {
      return url;
    }
    if (url.startsWith("#")) {
      return url;
    }
    if (!url.startsWith("/")) {
      return `../${url}`;
    }

    let newUrl = url.startsWith("/") ? url : `/${url}`;
    if (!image) {
      if (!newUrl.endsWith("/")) {
        newUrl += "/";
      }
    }
    return `/${version}/${lang}${newUrl}`;
  }

  const linkReferenceRenderer: (reference: any) => (string | any) = (reference: any) => {
    if (!reference.href) {
      if (!reference.children.length) {
        return `[][]`;
      }
      return <>[{reference.children}]</>;
    }
    return `[][]`
  };
  
  return <>
    <div id = "content" className = "markdown w-full">
      <ReactMarkdown source = {page} escapeHtml = {false} renderers = {{
        code: CodeBlock,
        inlineCode: InlineCode,
        linkReference: linkReferenceRenderer,
        table: Table,
        tableCell: TableCell,
        link: Clink,
        heading: (props) => {
          return Heading(props);
        },
        containerDirective: (props) => {
          if (!directives.hasOwnProperty(props.name)) {
            return <>Invalid container directive! `{props.name}`</>
          }
          return directives[props.name](props, { headingId: slugger.slug(props.attributes.name) });
        },
        textDirective: props => {
          // This feels super scuffed, will need to monitor it to make sure it is fine
          return <>:{props.name}</>;
        },
        leafDirective: props => {
          if (!directives.hasOwnProperty(props.name)) {
            return <>Invalid leaf directive! `{props.name}`</>
          }
          return directives[props.name](props, { headingId: slugger.slug(props.attributes.name) });
        }
      }} transformLinkUri = {uri => transform(uri, false)} transformImageUri = {uri => transform(uri, true)} plugins = {[gfm, directive, normalizeHeadings, slug]}/>
    </div>
  </>
}
