import { sortBy } from "common/collections";
import { classes } from "common/react";
<<<<<<< HEAD
import { InfernoNode } from "inferno";
import { useBackend, useLocalState } from "../../backend";
import { Box, Button, Dropdown, Flex, Stack, Tooltip } from "../../components";
import { createSetPreference, JoblessRole, JobPriority, PreferencesMenuData } from "./data";
import { Job } from "./jobs/base";
import * as Departments from "./jobs/departments";

const requireJob = require.context("./jobs/jobs", false, /.ts$/);
const jobsByDepartment = new Map<Departments.Department, {
  jobs: Job[],
  head?: Job,
  picture?: string,
}>();

/* MOJAVE EDIT ADDITION START - FACTION SWITCH*/
export enum Faction {
  NCR,
  Town,
  BOS,
  Raiders,
  Wasteland
}

/* MOJAVE EDIT ADDITION STOP - FACTION SWITCH*/
const binaryInsertJob = binaryInsertWith((job: Job) => {
  return job.name;
});
=======
import { InfernoNode, SFC } from "inferno";
import { useBackend } from "../../backend";
import { Box, Button, Dropdown, Stack, Tooltip } from "../../components";
import { createSetPreference, Job, JoblessRole, JobPriority, PreferencesMenuData } from "./data";
import { ServerPreferencesFetcher } from "./ServerPreferencesFetcher";

const sortJobs = (
  entries: [string, Job][],
  head?: string,
) => sortBy<[string, Job]>(
  ([key, _]) => key === head ? -1 : 1,
  ([key, _]) => key,
)(entries);
>>>>>>> 0989ce2d6fd... Remove job .tsx files from preferences menu, use compiled data instead (#63200)

const PRIORITY_BUTTON_SIZE = "18px";

const PriorityButton = (props: {
  name: string,
  color: string,
  modifier?: string,
  enabled: boolean,
  onClick: () => void,
}) => {
  const className = `PreferencesMenu__Jobs__departments__priority`;

  return (
    <Stack.Item height={PRIORITY_BUTTON_SIZE}>
      <Button
        className={classes([
          className,
          props.modifier && `${className}--${props.modifier}`,
        ])}
        color={props.enabled ? props.color : "white"}
        circular
        onClick={props.onClick}
        tooltip={props.name}
        tooltipPosition="bottom"
        height={PRIORITY_BUTTON_SIZE}
        width={PRIORITY_BUTTON_SIZE}
      />
    </Stack.Item>
  );
};

type CreateSetPriority = (priority: JobPriority | null) => () => void;

const createSetPriorityCache: Record<string, CreateSetPriority> = {};

const createCreateSetPriorityFromName
  = (context, jobName: string): CreateSetPriority => {
    if (createSetPriorityCache[jobName] !== undefined) {
      return createSetPriorityCache[jobName];
    }

    const perPriorityCache: Map<JobPriority | null, () => void> = new Map();

    const createSetPriority = (priority: JobPriority | null) => {
      const existingCallback = perPriorityCache.get(priority);
      if (existingCallback !== undefined) {
        return existingCallback;
      }

      const setPriority = () => {
        const { act } = useBackend<PreferencesMenuData>(context);

        act("set_job_preference", {
          job: jobName,
          level: priority,
        });
      };

      perPriorityCache.set(priority, setPriority);
      return setPriority;
    };

    createSetPriorityCache[jobName] = createSetPriority;

    return createSetPriority;
  };

const PriorityHeaders = () => {
  const className = "PreferencesMenu__Jobs__PriorityHeader";

  return (
    <Stack>
      <Stack.Item grow />

      <Stack.Item className={className}>
        Off
      </Stack.Item>

      <Stack.Item className={className}>
        Low
      </Stack.Item>

      <Stack.Item className={className}>
        Medium
      </Stack.Item>

      <Stack.Item className={className}>
        High
      </Stack.Item>
    </Stack>
  );
};

const PriorityButtons = (props: {
  createSetPriority: CreateSetPriority,
  isOverflow: boolean,
  priority: JobPriority,
}) => {
  const { createSetPriority, isOverflow, priority } = props;

  return (
    <Stack
      style={{
        "align-items": "center",
        "height": "100%",
        "justify-content": "flex-end",
        "padding-left": "0.3em",
      }}
    >
      {isOverflow
        ? (
          <>
            <PriorityButton
              name="Off"
              modifier="off"
              color="light-grey"
              enabled={!priority}
              onClick={createSetPriority(null)}
            />

            <PriorityButton
              name="On"
              color="green"
              enabled={!!priority}
              onClick={createSetPriority(JobPriority.High)}
            />
          </>
        )
        : (
          <>
            <PriorityButton
              name="Off"
              modifier="off"
              color="light-grey"
              enabled={!priority}
              onClick={createSetPriority(null)}
            />

            <PriorityButton
              name="Low"
              color="red"
              enabled={priority === JobPriority.Low}
              onClick={createSetPriority(JobPriority.Low)}
            />

            <PriorityButton
              name="Medium"
              color="yellow"
              enabled={priority === JobPriority.Medium}
              onClick={createSetPriority(JobPriority.Medium)}
            />

            <PriorityButton
              name="High"
              color="green"
              enabled={priority === JobPriority.High}
              onClick={createSetPriority(JobPriority.High)}
            />
          </>
        )}
    </Stack>
  );
};

const JobRow = (props: {
  className?: string,
  job: Job,
  name: string,
}, context) => {
  const { data } = useBackend<PreferencesMenuData>(context);
  const { className, job, name } = props;

  const isOverflow = data.overflow_role === name;
  const priority = data.job_preferences[name];

  const createSetPriority = createCreateSetPriorityFromName(context, name);

  const experienceNeeded = data.job_required_experience
    && data.job_required_experience[name];
  const daysLeft = data.job_days_left ? data.job_days_left[name] : 0;

  let rightSide: InfernoNode;

  if (experienceNeeded) {
    const { experience_type, required_playtime } = experienceNeeded;
    const hoursNeeded = Math.ceil(required_playtime / 60);

    rightSide = (
      <Stack align="center" height="100%" pr={1}>
        <Stack.Item grow textAlign="right">
          <b>{hoursNeeded}h</b> as {experience_type}
        </Stack.Item>
      </Stack>
    );
  } else if (daysLeft > 0) {
    rightSide = (
      <Stack align="center" height="100%" pr={1}>
        <Stack.Item grow textAlign="right">
          <b>{daysLeft}</b> day{daysLeft === 1 ? "" : "s"} left
        </Stack.Item>
      </Stack>
    );
  } else if (data.job_bans && data.job_bans.indexOf(name) !== -1) {
    rightSide = (
      <Stack align="center" height="100%" pr={1}>
        <Stack.Item grow textAlign="right">
          <b>Banned</b>
        </Stack.Item>
      </Stack>
    );
  } else {
    rightSide = (<PriorityButtons
      createSetPriority={createSetPriority}
      isOverflow={isOverflow}
      priority={priority}
    />);
  }

  return (
    <Stack.Item className={className} height="100%" style={{
      "margin-top": 0,
    }}>
      <Stack fill align="center">
        <Tooltip
          content={job.description}
          position="bottom-start"
        >
          <Stack.Item className="job-name" width="50%" style={{
            "padding-left": "0.3em",
          }}>

            {name}
          </Stack.Item>
        </Tooltip>

        <Stack.Item grow className="options">
          {rightSide}
        </Stack.Item>
      </Stack>
    </Stack.Item>
  );
};

const Department: SFC<{ department: string}> = (props) => {
  const { children, department: name } = props;
  const className = `PreferencesMenu__Jobs__departments--${name}`;

  return (
    <ServerPreferencesFetcher
      render={(data) => {
        if (!data) {
          return null;
        }

        const { departments, jobs } = data.jobs;
        const department = departments[name];

        // This isn't necessarily a bug, it's like this
        // so that you can remove entire departments without
        // having to edit the UI.
        // This is used in events, for instance.
        if (!department) {
          return null;
        }

        const jobsForDepartment = sortJobs(
          Object.entries(jobs).filter(
            ([_, job]) => job.department === name
          ),
          department.head
        );

        return (
          <Box>
            <Stack
              vertical
              fill>
              {jobsForDepartment.map(([name, job]) => {
                return (<JobRow
                  className={classes([className, name === department.head && "head"])}
                  key={name}
                  job={job}
                  name={name}
                />);
              })}
            </Stack>

            {children}
          </Box>
        );
      }}
    />
  );
};

// *Please* find a better way to do this, this is RIDICULOUS.
// All I want is for a gap to pretend to be an empty space.
// But in order for everything to align, I also need to add the 0.2em padding.
// But also, we can't be aligned with names that break into multiple lines!
const Gap = (props: {
  amount: number,
}) => {
  // 0.2em comes from the padding-bottom in the department listing
  return <Box height={`calc(${props.amount}px + 0.2em)`} />;
};

const JoblessRoleDropdown = (props, context) => {
  const { act, data } = useBackend<PreferencesMenuData>(context);
  const selected = data.character_preferences.misc.joblessrole;

  const options = [
    {
      displayText: `Join as ${data.overflow_role} if unavailable`,
      value: JoblessRole.BeOverflow,
    },
    {
      displayText: `Join as a random job if unavailable`,
      value: JoblessRole.BeRandomJob,
    },
    {
      displayText: `Return to lobby if unavailable`,
      value: JoblessRole.ReturnToLobby,
    },
  ];

  return (
    <Box
      position="absolute"
      right={0}
      width="30%"
    >
      <Dropdown
        width="100%"
        selected={selected}
        onSelected={createSetPreference(act, "joblessrole")}
        options={options}
        displayText={
          <Box pr={1}>
            {options.find(option => option.value === selected)!.displayText}
          </Box>
        }
      />
    </Box>
  );
};

export const JobSwitch = (faction) => {
  switch (faction) {
    case Faction.NCR:
      return (
        <>

          <Stack.Item mr={1}>
            <Gap amount={36} />
            <PriorityHeaders />
            <Gap amount={6} />
            <Department
              department={Departments.NCR}
              name="NCR" />
            <Gap amount={6} />
          </Stack.Item>

          <Stack.Item mr={1}>
            <Gap amount={36} />
          </Stack.Item>
        </>
      );
    case Faction.Town:
      return (
        <>
          <Stack.Item mr={1}>
            <Gap amount={36} />
            <PriorityHeaders />
            <Gap amount={6} />
            <Department
              department={Departments.Town}
              name="Town" />
            <Gap amount={6} />
          </Stack.Item>

          <Stack.Item mr={1}>
            <Gap amount={36} />
          </Stack.Item>
        </>
      );
    case Faction.BOS:
      return (
        <>
          <Stack.Item mr={1}>
            <Gap amount={36} />
            <PriorityHeaders />
            <Gap amount={6} />
            <Department
              department={Departments.BOS}
              name="BOS" />
            <Gap amount={6} />
          </Stack.Item>

          <Stack.Item mr={1}>
            <Gap amount={36} />
          </Stack.Item>
        </>
      );
    case Faction.Raiders:
      return (
        <>
          <Stack.Item mr={1}>
            <Gap amount={36} />
            <PriorityHeaders />
            <Gap amount={6} />
            <Department
              department={Departments.Raiders}
              name="Raiders" />
            <Gap amount={6} />
          </Stack.Item>

          <Stack.Item mr={1}>
            <Gap amount={36} />
          </Stack.Item>
        </>
      );
    case Faction.Wasteland:
      return (
        <>
          <Stack.Item mr={1}>
            <Gap amount={36} />
            <PriorityHeaders />
            <Gap amount={6} />
            <Department
              department={Departments.Wasteland}
              name="Wasteland" />
            <Gap amount={6} />
          </Stack.Item>

          <Stack.Item mr={1}>
            <Gap amount={36} />
          </Stack.Item>
        </>
      );
  }
};

export const GetFactionPicture = (faction) => {
  switch (faction) {
    case Faction.NCR:
      return <img src={Departments.NCR.picture} />;
    case Faction.Town:
      return <img src={Departments.Town.picture} />;
    case Faction.BOS:
      return <img src={Departments.BOS.picture} />;
    case Faction.Raiders:
      return <img src={Departments.Raiders.picture} />;
    case Faction.Wasteland:
      return <img src={Departments.Wasteland.picture} />;
  }
};

export const JobsPage = (props, context) => {
  const [
    currentFaction,
    setCurrentFaction,
  ] = useLocalState<any | null>(context, 'jobsPage', Faction.NCR);

  const nextFaction = () => {
    const nextFaction = (currentFaction + 1) % 5;
    setCurrentFaction(nextFaction);
  };
  const previousFaction = () => {
    const previousFaction = (currentFaction - 1) % 5;
    if (previousFaction < 0) {
      setCurrentFaction(Faction.Wasteland);
    }
    else {
      setCurrentFaction(previousFaction);
    }
  };

  const getFactionName = () => {
    switch (currentFaction) {
      case Faction.NCR:
        return "NCR";
      case Faction.Town:
        return "Town";
      case Faction.BOS:
        return "BOS";
      case Faction.Raiders:
        return "Raiders";
      case Faction.Wasteland:
        return "Wasteland";
    }
  };
  const activeFactionMenu = JobSwitch(currentFaction);
  const className = "PreferencesMenu__Jobs";

  return (
    <>
      <>
        <Button
          content="NCR"
          color={currentFaction === Faction.NCR ? "green" : null}
          onClick={() => { setCurrentFaction(Faction.NCR);
          }}
        />
        <Button
          content="Town"
          color={currentFaction === Faction.Town ? "green" : null}
          onClick={() => setCurrentFaction(Faction.Town)}
        />
        <Button
          content="Brotherhood of Steel"
          color={currentFaction === Faction.BOS ? "green" : null}
          onClick={() => setCurrentFaction(Faction.BOS)}
        />
        <Button
          content="Raiders"
          color={currentFaction === Faction.Raiders ? "green" : null}
          onClick={() => setCurrentFaction(Faction.Raiders)}
        />
        <Button
          content="Wasteland"
          color={currentFaction === Faction.Wasteland ? "green" : null}
          onClick={() => setCurrentFaction(Faction.Wasteland)}
        />
      </>
      <Box
        position="absolute"
        right={21}
        width="30%"
      />
      <Gap amount={50} />
      <div>
        <Box
          position="absolute"
          right={30}
          width="30%"
        >
          <Flex.Item
            className={classes([
              `${className}__faction`,
            ])}
            key={currentFaction}
          >
            <Stack align="center" vertical>
              <Stack.Item style={{
                "font-weight": "bold",
                "margin-top": "auto",
                "max-width": "100px",
                "text-align": "center",
              }}>
                {getFactionName()}
              </Stack.Item>
              <Stack.Item align="center">
                <Tooltip content={
                  <>The New California Republic</>
                } position="bottom">
                  <Box
                    className={"faction-icon-parent"}
                  >
                    {GetFactionPicture(currentFaction)}

                    {/* {isBanned && (
                      <Box className="antagonist-banned-slash" />
                    )}

                    {daysLeft > 0 && (
                      <Box className="antagonist-days-left">
                        <b>{daysLeft}</b> days left
                      </Box>

                    )}
                  */ }
                  </Box>
                </Tooltip>
                <Gap amount={25} />
                <Button
                  icon="chevron-left"
                  content="Previous"
                  onClick={previousFaction}
                />
                <Button
                  icon="chevron-right"
                  content="Next"
                  onClick={nextFaction}
                />
              </Stack.Item>
            </Stack>

          </Flex.Item>
          {/* {GetFactionPicture(currentFaction)} */}

        </Box>
      </div>
      <Gap amount={160} />
      <JoblessRoleDropdown />
      <Stack vertical fill>
        <Gap amount={22} />
        <Stack.Item>
          <Stack fill className="PreferencesMenu__Jobs">
            {/* MOJAVE EDIT REMOVAL BEGIN - DEPARTMENTS
            <Stack.Item mr={1}>
              <Gap amount={36} />

              <PriorityHeaders />

              <Department department="Engineering">
                <Gap amount={6} />
              </Department>

              <Department department="Science">
                <Gap amount={6} />
              </Department>

              <Department department="Silicon">
                <Gap amount={12} />
              </Department>

              <Department
                department="Assistant"
              />
            </Stack.Item>

            <Stack.Item mr={1}>
              <PriorityHeaders />

              <Department department="Captain">
                <Gap amount={6} />
              </Department>

              <Department department="Service">
                <Gap amount={6} />
              </Department>

              <Department department="Cargo" />
            </Stack.Item>

            <Stack.Item>
              <Gap amount={36} />

              <PriorityHeaders />

              <Department department="Security">
                <Gap amount={6} />
              </Department>

              <Department
                department="Medical"
              />
            </Stack.Item>
            MOJAVE EDIT REMOVAL END - DEPARTMENTS*/}

            {/* MOJAVE EDIT ADDITION START - DEPARTMENTS */}
            <Box
              position="absolute"
              right={30}
              width="30%"
              verticalAlign="middle"
            >
              {activeFactionMenu}
            </Box>
            {/* MOJAVE EDIT ADDITION END - DEPARTMENTS */}
          </Stack>
        </Stack.Item>
      </Stack>
    </>
  );
};
