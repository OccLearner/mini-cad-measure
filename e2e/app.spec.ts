import { expect, test } from '@playwright/test';

test('renders the application shell', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('banner')).toContainText('mini-cad-measure');
  await expect(page.getByRole('img', { name: 'CAD 画布' })).toBeVisible();
  await expect(page.getByRole('complementary', { name: '属性面板' })).toBeVisible();
});

test('draws, selects, measures, uses history, and restores local save', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const canvas = page.locator('.cad-canvas');
  const entityShapes = page.locator(
    '.cad-entities .cad-entity:not(.cad-draft):not(.cad-selection-halo)'
  );
  const committedMeasurements = page.locator(
    '.cad-measurements .cad-measurement:not(.cad-measurement-preview)'
  );
  const box = await canvas.boundingBox();

  if (!box) {
    throw new Error('Canvas was not rendered');
  }

  const point = (x: number, y: number) => ({
    x: box.x + x,
    y: box.y + y
  });

  await page.getByRole('button', { name: '直线' }).click();
  await page.mouse.move(point(260, 260).x, point(260, 260).y);
  await page.mouse.down();
  await page.mouse.move(point(420, 260).x, point(420, 260).y);
  await page.mouse.up();
  await expect(entityShapes).toHaveCount(1);

  await page.getByRole('button', { name: '选择' }).click();
  await page.mouse.click(point(340, 260).x, point(340, 260).y);
  await expect(page.getByText('entity-0001')).toBeVisible();

  await page.getByRole('button', { name: '撤销' }).click();
  await expect(entityShapes).toHaveCount(0);

  await page.getByRole('button', { name: '重做' }).click();
  await expect(entityShapes).toHaveCount(1);

  await page.getByRole('button', { name: '测量' }).click();
  await page.mouse.click(point(260, 320).x, point(260, 320).y);
  await page.mouse.move(point(360, 320).x, point(360, 320).y);
  await page.mouse.click(point(360, 320).x, point(360, 320).y);
  await expect(committedMeasurements).toHaveCount(1);

  await page.getByRole('button', { name: '保存' }).click();
  await page.reload();

  await expect(entityShapes).toHaveCount(1);
  await expect(committedMeasurements).toHaveCount(1);
});

test('supports phase 6-A interaction shortcuts and deletion flows', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const canvas = page.locator('.cad-canvas');
  const entityShapes = page.locator(
    '.cad-entities .cad-entity:not(.cad-draft):not(.cad-selection-halo)'
  );
  const committedMeasurements = page.locator(
    '.cad-measurements .cad-measurement:not(.cad-measurement-preview)'
  );
  const box = await canvas.boundingBox();

  if (!box) {
    throw new Error('Canvas was not rendered');
  }

  const point = (x: number, y: number) => ({
    x: box.x + x,
    y: box.y + y
  });

  await page.keyboard.press('v');
  await expect(page.getByRole('button', { name: '选择' })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('h');
  await expect(page.getByRole('button', { name: '平移' })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('l');
  await expect(page.getByRole('button', { name: '直线' })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('r');
  await expect(page.getByRole('button', { name: '矩形' })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('c');
  await expect(page.getByRole('button', { name: '圆' })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('d');
  await expect(page.getByRole('button', { name: '测量' })).toHaveAttribute('aria-pressed', 'true');

  await expect(page.getByRole('button', { name: 'Fit All' })).toBeVisible();
  await page.getByRole('button', { name: 'Fit All' }).click();

  await page.keyboard.press('l');
  await page.mouse.move(point(250, 250).x, point(250, 250).y);
  await page.mouse.down();
  await page.mouse.move(point(410, 250).x, point(410, 250).y);
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await expect(entityShapes).toHaveCount(0);

  await page.mouse.move(point(250, 250).x, point(250, 250).y);
  await page.mouse.down();
  await page.mouse.move(point(410, 250).x, point(410, 250).y);
  await page.mouse.up();
  await expect(entityShapes).toHaveCount(1);

  await page.keyboard.press('Delete');
  await expect(entityShapes).toHaveCount(0);

  await page.keyboard.press('Control+Z');
  await expect(entityShapes).toHaveCount(1);

  await page.keyboard.press('Control+Shift+Z');
  await expect(entityShapes).toHaveCount(0);

  await page.keyboard.press('Control+Z');
  await expect(entityShapes).toHaveCount(1);

  await page.keyboard.press('d');
  await page.mouse.click(point(260, 320).x, point(260, 320).y);
  await page.mouse.move(point(360, 320).x, point(360, 320).y);
  await page.mouse.click(point(360, 320).x, point(360, 320).y);
  await expect(committedMeasurements).toHaveCount(1);

  await page.getByRole('button', { name: '删除 measurement-0001' }).click();
  await expect(committedMeasurements).toHaveCount(0);

  await page.keyboard.press('Control+Z');
  await expect(committedMeasurements).toHaveCount(1);

  await page.getByRole('button', { name: 'Fit All' }).click();
  await expect(entityShapes).toHaveCount(1);
  await expect(committedMeasurements).toHaveCount(1);
});
