import { NextRequest, NextResponse } from 'next/server';
import { getProductCustomFields, createCustomField, updateCustomField, removeCustomField } from '@/app/lib/bigcommerceService';

export async function POST(req: NextRequest) {
  try {
    console.log(8888, { req });

    const { productId, name, value } = await req.json();

    if (!productId || !name || !value) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch existing custom fields for the product
    const customFields = await getProductCustomFields(productId);
    const restrictUsersField = customFields.find((field: any) => field.name === name);

    let result;
    if (restrictUsersField && restrictUsersField.id) {
      // Update existing custom field
      result = await updateCustomField(productId, restrictUsersField.id, { name, value });
    } else {
      // Create new custom field
      result = await createCustomField(productId, { name, value });
    }

    return NextResponse.json({ success: !!result, data: result });
  } catch (error) {
    console.error('Error managing custom field:', error);
    return NextResponse.json({ success: false, error: 'Failed to manage custom field' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    console.log(8888, { req });

    const { productId, customFieldId } = await req.json();

    if (!productId || !customFieldId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    let result;
    result = await removeCustomField(productId, customFieldId);
    console.log({result});

    return NextResponse.json({ success: !!result });
  } catch (error) {
    console.error('Error deleting custom field:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete custom field' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get('productId');
    const filterName = req.nextUrl.searchParams.get('filterName');
    if (!productId) {
      return NextResponse.json({ success: false, error: 'Missing productId' }, { status: 400 });
    }

    const customFields = filterName ? (await getProductCustomFields(parseInt(productId))).filter((c: any) => c.name === filterName) : await getProductCustomFields(parseInt(productId));
    return NextResponse.json(customFields);
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch custom fields' }, { status: 500 });
  }
}