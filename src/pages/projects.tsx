import { InferGetStaticPropsType, type NextPage } from "next";
import { z } from "zod";
import Head from "next/head";
import React from "react";

const REPOS = {
  personal: [
    "juliusmarminge/stocks",
    "juliusmarminge/pathfinding-visualizer",
    "juliusmarminge/sorting-visualizer",
  ],
  oss: ["t3-oss/create-t3-app", "trpc/trpc"],
} as const;

const RepoValidator = z.object({
  name: z.string(),
  description: z.string(),
  html_url: z.string().url(),
  homepage: z.string().url(),
  language: z.string(),
  stargazers_count: z.number(),
});
type Repo = z.infer<typeof RepoValidator>;

export const getStaticProps = async () => {
  let repos: Record<keyof typeof REPOS, Repo[]> = { personal: [], oss: [] };

  if (process.env.NODE_ENV === "development") {
    // to prevent rate-limiting during dev
    repos.personal.push({
      name: "stocks",
      description: "A stock market simulator",
      html_url: "https://github.com/juliusmarminge/stocks",
      homepage: "https://stocks.jumr.dev",
      language: "TypeScript",
      stargazers_count: 42069,
    });
    return { props: { repos } };
  }

  for (const repo of REPOS.personal) {
    const repoRes = await (
      await fetch(`https://api.github.com/repos/${repo}`)
    ).json();
    const validated = RepoValidator.safeParse(repoRes);
    console.log(repoRes);
    if (validated.success) {
      repos.personal.push(validated.data);
    }
  }

  for (const repo of REPOS.oss) {
    const repoRes = await (
      await fetch(`https://api.github.com/repos/${repo}`)
    ).json();
    const validated = RepoValidator.safeParse(repoRes);
    if (validated.success) {
      repos.oss.push(validated.data);
    }
  }

  return {
    props: {
      repos,
    },
    revalidate: 86400,
  };
};

const ProjectSection: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => {
  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold py-1">{title}</h2>
      <p className="text-md pb-4">{description}</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </div>
  );
};

const ProjectCard: React.FC<{ repo: Repo }> = ({ repo }) => {
  return (
    <div className="p-4 bg-base-300 hover:bg-base-200 rounded-lg ">
      <h3 className="text-xl font-bold">{repo.name}</h3>
    </div>
  );
};

const ProjectsPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  repos,
}) => {
  return (
    <>
      <Head key="projects">
        <title>Projects</title>
      </Head>
      <div className="p-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <ProjectSection
          title="Personal"
          description=" These are some projects that I have built on my spare time as hobby
            projects."
        >
          {repos.personal.map((repo) => (
            <ProjectCard key={repo.name} repo={repo} />
          ))}
        </ProjectSection>
        <ProjectSection
          title="Open Source"
          description="These are some Open Source projets I often contribute to."
        >
          {repos.oss.map((repo) => (
            <ProjectCard key={repo.name} repo={repo} />
          ))}
        </ProjectSection>
      </div>
    </>
  );
};

export default ProjectsPage;
