import streamlit as st
import gspread
from google.oauth2.service_account import Credentials
import pandas as pd
from datetime import datetime, date

# 페이지 설정
st.set_page_config(
    page_title="까미 병원비 정산",
    page_icon="🐕",
    layout="centered"
)

# 모바일 친화적 CSS
st.markdown("""
<style>
    .stApp {
        max-width: 500px;
        margin: 0 auto;
    }
    .metric-card {
        background: white;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        margin-bottom: 12px;
    }
    .metric-label {
        color: #666;
        font-size: 14px;
    }
    .metric-value {
        font-size: 28px;
        font-weight: bold;
        color: #1e40af;
    }
    .member-row {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid #eee;
    }
    .remaining {
        color: #dc2626;
        font-weight: 600;
    }
    .complete {
        color: #16a34a;
        font-weight: 600;
    }
    div[data-testid="stForm"] {
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
</style>
""", unsafe_allow_html=True)

# Google Sheets 연결
@st.cache_resource
def get_gsheet_connection():
    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
    ]
    credentials = Credentials.from_service_account_info(
        st.secrets["gcp_service_account"],
        scopes=scopes
    )
    client = gspread.authorize(credentials)
    return client

def get_spreadsheet():
    client = get_gsheet_connection()
    return client.open_by_key(st.secrets["spreadsheet_id"])

def load_expenses():
    try:
        sheet = get_spreadsheet().worksheet("expenses")
        data = sheet.get_all_records()
        return pd.DataFrame(data) if data else pd.DataFrame(columns=['id', 'date', 'amount', 'memo'])
    except:
        return pd.DataFrame(columns=['id', 'date', 'amount', 'memo'])

def load_payments():
    try:
        sheet = get_spreadsheet().worksheet("payments")
        data = sheet.get_all_records()
        return pd.DataFrame(data) if data else pd.DataFrame(columns=['id', 'date', 'payer', 'amount'])
    except:
        return pd.DataFrame(columns=['id', 'date', 'payer', 'amount'])

def add_expense(date_val, amount, memo):
    sheet = get_spreadsheet().worksheet("expenses")
    new_id = int(datetime.now().timestamp() * 1000)
    sheet.append_row([new_id, str(date_val), amount, memo])

def add_payment(date_val, payer, amount):
    sheet = get_spreadsheet().worksheet("payments")
    new_id = int(datetime.now().timestamp() * 1000)
    sheet.append_row([new_id, str(date_val), payer, amount])

def delete_row(sheet_name, row_idx):
    sheet = get_spreadsheet().worksheet(sheet_name)
    sheet.delete_rows(row_idx + 2)  # +2 because of header and 0-index

# 멤버 목록
MEMBERS = ['엄마', '승화', '승진']

# 헤더
col_title, col_refresh = st.columns([4, 1])
with col_title:
    st.markdown("# 🐕 까미 병원비 정산")
with col_refresh:
    st.markdown("<br>", unsafe_allow_html=True)
    if st.button("🔄", help="새로고침"):
        st.cache_resource.clear()
        st.rerun()

# 탭
tab1, tab2, tab3 = st.tabs(["📊 현황", "💸 병원비", "💰 입금"])

# 데이터 로드
expenses_df = load_expenses()
payments_df = load_payments()

# 계산
total_expense = expenses_df['amount'].sum() if len(expenses_df) > 0 else 0
per_person = int(total_expense / 3) if total_expense > 0 else 0

paid_by_member = {}
for member in MEMBERS:
    if len(payments_df) > 0:
        paid_by_member[member] = payments_df[payments_df['payer'] == member]['amount'].sum()
    else:
        paid_by_member[member] = 0

remaining = {
    '엄마': 0,
    '승화': per_person - paid_by_member['승화'],
    '승진': per_person - paid_by_member['승진']
}

# 탭1: 현황
with tab1:
    # 총 병원비
    st.markdown(f"""
    <div class="metric-card" style="text-align: center;">
        <div class="metric-label">총 병원비</div>
        <div class="metric-value">{total_expense:,}원</div>
        <div style="color: #999; font-size: 12px;">1인당 {per_person:,}원</div>
    </div>
    """, unsafe_allow_html=True)
    
    # 정산 현황
    st.markdown("### 정산 현황")
    for member in MEMBERS:
        if member == '엄마':
            status = '<span class="complete">완료 ✓</span>'
            sub = '(지불자)'
        elif remaining[member] <= 0:
            status = '<span class="complete">완료 ✓</span>'
            sub = f'입금: {paid_by_member[member]:,}원'
        else:
            status = f'<span class="remaining">{remaining[member]:,}원 남음</span>'
            sub = f'입금: {paid_by_member[member]:,}원'
        
        st.markdown(f"""
        <div class="member-row">
            <div>
                <strong>{member}</strong>
                <span style="color: #999; font-size: 12px; margin-left: 4px;">{sub}</span>
            </div>
            <div>{status}</div>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # 최근 병원비
    st.markdown("### 병원비 지출 내역")
    if len(expenses_df) > 0:
        for idx, row in expenses_df.iloc[::-1].head(10).iterrows():
            col1, col2 = st.columns([3, 1])
            with col1:
                memo_text = f" - {row['memo']}" if row['memo'] else ""
                st.markdown(f"**{row['date']}**{memo_text}")
            with col2:
                st.markdown(f"**{int(row['amount']):,}원**")
    else:
        st.info("아직 기록이 없어요")
    
    st.markdown("---")
    
    # 최근 입금
    st.markdown("### 입금 내역")
    if len(payments_df) > 0:
        for idx, row in payments_df.iloc[::-1].head(10).iterrows():
            col1, col2 = st.columns([3, 1])
            with col1:
                st.markdown(f"**{row['payer']}** · {row['date']}")
            with col2:
                st.markdown(f"**{int(row['amount']):,}원**")
    else:
        st.info("아직 기록이 없어요")

# 탭2: 병원비 입력
with tab2:
    st.markdown("### 병원비 지출 기록")
    
    with st.form("expense_form", clear_on_submit=True):
        expense_date = st.date_input("날짜", value=date.today())
        expense_amount = st.number_input("금액", min_value=0, step=1000, format="%d")
        expense_memo = st.text_input("메모 (선택)", placeholder="예: 예방접종, 건강검진")
        
        submitted = st.form_submit_button("기록하기", use_container_width=True, type="primary")
        
        if submitted and expense_amount > 0:
            add_expense(expense_date, expense_amount, expense_memo)
            st.success("기록했어요!")
            st.rerun()

# 탭3: 입금 입력
with tab3:
    st.markdown("### 입금 기록")
    
    with st.form("payment_form", clear_on_submit=True):
        payment_payer = st.radio("입금자", ['승화', '승진'], horizontal=True)
        payment_date = st.date_input("날짜", value=date.today(), key="payment_date")
        payment_amount = st.number_input("금액", min_value=0, step=10000, format="%d", key="payment_amount")
        
        submitted = st.form_submit_button("입금 기록하기", use_container_width=True, type="primary")
        
        if submitted and payment_amount > 0:
            add_payment(payment_date, payment_payer, payment_amount)
            st.success("기록했어요!")
            st.rerun()
