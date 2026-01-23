import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const AMAZON_SEARCH_URL = 'https://www.amazon.com/s?k=';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword');
  if (!keyword) {
    return NextResponse.json({ error: 'Missing keyword' }, { status: 400 });
  }
  try {
    const res = await fetch(`${AMAZON_SEARCH_URL}${encodeURIComponent(keyword)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const firstProduct = $('div.s-main-slot div[data-component-type="s-search-result"]').first();
    const title = firstProduct.find('h2 a span').text();
    const link = 'https://www.amazon.com' + firstProduct.find('h2 a').attr('href');
    const image = firstProduct.find('img.s-image').attr('src');
    if (!title || !link || !image) {
      return NextResponse.json({ error: 'No product found' }, { status: 404 });
    }
    return NextResponse.json({ title, link, image });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to scrape Amazon', details: error }, { status: 500 });
  }
} 