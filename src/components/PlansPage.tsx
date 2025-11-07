'use client';
import React from 'react';

// Função para iniciar checkout do Stripe
const handleCheckout = async (priceId: string) => {
  try {
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url; // Redireciona para o Stripe
    } else {
      alert('Erro ao iniciar o pagamento. Tente novamente.');
    }
  } catch (error) {
    console.error('Erro no checkout:', error);
    alert('Erro ao conectar com o Stripe.');
  }
};

export default function PlansPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Escolha seu Plano</h1>
        <p className="text-gray-500">
          Proteja seus e-mails com a melhor tecnologia brasileira
        </p>
      </div>

      {/* Planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PLANO GRATUITO */}
        <div className="border rounded-2xl p-6 text-center shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Gratuito</h2>
          <p className="text-2xl font-bold mb-4">R$ 0/mês</p>
          <ul className="space-y-2 text-gray-600 text-sm mb-6">
            <li>1 conta de e-mail</li>
            <li>Até 200 e-mails analisados/mês</li>
            <li>Detecção básica de spam</li>
            <li>Suporte por e-mail</li>
          </ul>
          <button
            disabled
            className="w-full py-2 bg-gray-200 text-gray-500 rounded-lg font-medium cursor-not-allowed"
          >
            Plano Atual
          </button>
        </div>

        {/* PLANO PRO */}
        <div className="border-2 border-blue-500 rounded-2xl p-6 text-center shadow-lg">
          <h2 className="text-xl font-semibold mb-2 text-blue-600">Pro</h2>
          <p className="text-2xl font-bold mb-4">R$ 34,99/mês</p>
          <ul className="space-y-2 text-gray-600 text-sm mb-6">
            <li>3 contas de e-mail</li>
            <li>5.000 e-mails analisados/mês</li>
            <li>Quarentena automática</li>
            <li>Detecção avançada de phishing</li>
            <li>Relatórios detalhados</li>
            <li>Suporte prioritário</li>
          </ul>
          <button
            onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!)}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Assinar Agora
          </button>
        </div>

        {/* PLANO EMPRESARIAL */}
        <div className="border rounded-2xl p-6 text-center shadow-sm">
          <h2 className="text-xl font-semibold mb-2 text-purple-600">
            Empresarial
          </h2>
          <p className="text-2xl font-bold mb-4">R$ 89,99/mês</p>
          <ul className="space-y-2 text-gray-600 text-sm mb-6">
            <li>Contas ilimitadas</li>
            <li>Multiusuário com permissões</li>
            <li>API para integração</li>
            <li>Relatórios empresariais</li>
            <li>Suporte 24/7</li>
            <li>Treinamento personalizado</li>
          </ul>
          <button
            onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID!)}
            className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Assinar Agora
          </button>
        </div>
      </div>

      {/* Garantia */}
      <div className="text-center text-sm text-gray-500 mt-8">
        <p>Garantia de 30 dias.</p>
        <p>
          Não ficou satisfeito? Cancelamos sua assinatura e devolvemos 100% do
          valor dentro do prazo.
        </p>
        <div className="flex justify-center gap-2 mt-2 text-green-600">
          <span>✅ Pagamento seguro via Stripe</span>
          <span>✅ Cancelamento a qualquer momento</span>
        </div>
      </div>
    </div>
  );
}
