import {
  Label,
  Input,
  Button,
  TabsRoot,
  TabsTrigger,
  TabsList,
  TabsContent,
  Checkbox,
  RadioButton,
  Switch,
  Select,
  SelectOption,
  Separator,
  Card,
  CardTitle,
  CardContent,
  CardFooter,
} from "@fiberplane/ascuii";
import { css } from "hono/css";

export function ComponentsPreview() {
  return (
    <div className={containerClassName}>
      <TabsRoot>
        <TabsList>
          <TabsTrigger active>Active Tab</TabsTrigger>
          <TabsTrigger>Inactive tab</TabsTrigger>
        </TabsList>
        <TabsContent>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </TabsContent>
      </TabsRoot>

      <Separator />

      <Card>
        <CardTitle>Title</CardTitle>
        <CardContent>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>

      <Separator />

      <Label htmlFor="input">Label</Label>
      <Input id="input" name="input" value="Input" />

      <Separator />

      <div className={horizontalFlexClassName}>
        <Checkbox id="checkbox" name="checkbox" />
        <Label htmlFor="checkbox">Check</Label>
      </div>

      <Separator />

      <div className={horizontalFlexClassName}>
        <Switch id="switch" name="switch" />
        <Label htmlFor="switch">Switch</Label>
      </div>

      <Separator />

      <div className={verticalFlexClassName}>
        <div className={horizontalFlexClassName}>
          <RadioButton id="radio1" name="radio" value="1" />
          <Label htmlFor="radio1">Radio</Label>
        </div>
        <div className={horizontalFlexClassName}>
          <RadioButton id="radio2" name="radio" value="2" />
          <Label htmlFor="radio2">Radio</Label>
        </div>
      </div>

      <Separator />

      <Select>
        <SelectOption value="option1">Option 1</SelectOption>
        <SelectOption value="option2">Option 2</SelectOption>
      </Select>

      <Separator />

      <Button>Button</Button>
    </div>
  );
}

const containerClassName = css`
  display: grid;
  gap: 16px;
`;

const verticalFlexClassName = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const horizontalFlexClassName = css`
  display: flex;
  gap: 8px;
`;
