export type ActionResult = Promise<
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    }
>;
